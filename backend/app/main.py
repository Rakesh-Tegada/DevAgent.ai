import subprocess
import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI(title="DevAgent.ai Core API")

# Enable CORS so your React frontend can talk to the backend safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the official Google GenAI SDK (expects GEMINI_API_KEY env variable)
try:
    client = genai.Client()
except Exception:
    client = None

class GenerationRequest(BaseModel):
    prompt: str

class AgentResponse(BaseModel):
    status: str
    iterations: int
    final_code: str
    terminal_logs: str

def execute_in_sandbox(code_content: str) -> tuple[int, str]:
    """
    Executes the generated Python code inside an isolated child process sandbox.
    Captures stdout, stderr, and the return exit code.
    """
    temp_filename = "sandbox_run.py"
    with open(temp_filename, "w", encoding="utf-8") as f:
        f.write(code_content)
        
    try:
        # Run code safely in a separate subprocess, capturing all terminal logs
        result = subprocess.run(
            [sys.executable, temp_filename],
            capture_output=True,
            text=True,
            timeout=10 # Prevent infinite loops from hanging the server
        )
        return result.returncode, result.stdout + "\n" + result.stderr
    except subprocess.TimeoutExpired:
        return -1, "Error: Execution timed out (Possible infinite loop detected)."
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/generate-agent", response_model=AgentResponse)
async def run_agent_loop(request: GenerationRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API client not configured. Set GEMINI_API_KEY.")

    user_requirement = request.prompt
    current_prompt = f"Write a clean, operational Python script to fulfill this request: {user_requirement}. Respond ONLY with raw code. Do not include markdown code blocks like ```python or any explanations."
    
    max_retries = 3
    iteration = 0
    current_code = ""
    logs = ""
    
    while iteration < max_retries:
        iteration += 1
        
        # Call gemini-2.5-flash using low-temperature for highly deterministic code structure
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=current_prompt,
            config=types.GenerateContentConfig(temperature=0.2)
        )
        
        current_code = response.text.strip()
        if current_code.startswith("```"):
            current_code = "\n".join(current_code.split("\n")[1:-1])
            
        # Execute the generated code inside our sandbox child process
        exit_code, terminal_output = execute_in_sandbox(current_code)
        logs += f"\n--- Iteration {iteration} Terminal Output (Exit Code: {exit_code}) ---\n{terminal_output}\n"
        
        # SELF-HEALING LOOP TRIGGER: Exit code 0 means success!
        if exit_code == 0:
            return AgentResponse(
                status="Success: Code compiled and ran perfectly.",
                iterations=iteration,
                final_code=current_code,
                terminal_logs=logs
            )
            
        # If code failed, feed the crash traceback directly back into the model context
        current_prompt = (
            f"The previous Python code you generated crashed with an exit code of {exit_code}.\n"
            f"Here are the exact terminal logs and error tracebacks:\n{terminal_output}\n"
            f"Analyze the mistake, fix the bug, and rewrite the complete script. Provide ONLY raw code."
        )

    return AgentResponse(
        status="Failure: Maximum self-healing iterations reached without a clean exit.",
        iterations=iteration,
        final_code=current_code,
        terminal_logs=logs + "\n[System Alert] Self-healing cycle timed out."
    )
