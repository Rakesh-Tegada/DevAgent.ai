
# DevAgent.ai 🤖

DevAgent.ai is a production-grade autonomous AI software engineering platform. It translates natural language feature requests into fully operational, verified Python source files using an asynchronous backend, isolated execution sandboxes, and a recursive self-healing repair loop.

## 🚀 Key Features

* **Natural Language to Code:** Instantly converts plain-English feature requirements into structured Python scripts.
* **Isolated Testing Sandbox:** Runs generated code safely inside isolated child processes to monitor runtime conditions and catch failures before delivery.
* **Self-Healing Agentic Loop:** Intercepts terminal crash logs and traceback errors, feeding them back to the LLM to recursively debug and rewrite code until it runs successfully.
* **Real-Time Dashboard:** Interactive interface to monitor the agent's step-by-step reasoning, execution logs, and final file outputs.

## 🛠️ Tech Stack

* **Frontend:** React.js, Bootstrap
* **Backend:** FastAPI (Python), Uvicorn
* **AI Architecture:** LangChain, Google GenAI SDK (Gemini Models), Agentic Loops
* **DevOps & Security:** Docker, Sandbox Child Processes, Git

## 🔄 How It Works

1. **Prompt Ingestion:** The user submits a feature request through the React UI.
2. **Code Generation:** FastAPI structures the request and invokes the LLM to generate pure Python code.
3. **Sandbox Validation:** The system spawns a background child process to execute the generated file.
4. **Self-Correction:** If the code throws an error, the traceback is captured and routed back into the LLM context for automated debugging.
5. **Successful Delivery:** The refined, error-free script is displayed and saved once it hits a successful exit code (`0`).
