import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const triggerAgentLoop = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:8000/generate-agent', {
        prompt: prompt
      });
      setResult(response.data);
    } catch (error) {
      alert('Error connecting to the FastAPI Agent backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#212529', color: '#f8f9fa', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #6c757d', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2 style={{ color: '#198754', margin: 0 }}>🤖 DevAgent.ai</h2>
        <p style={{ color: '#6c757d', margin: '5px 0 0 0' }}>Production-Grade Autonomous AI Software Engineering Platform</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Input Panel */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#343a40', padding: '20px', borderRadius: '8px' }}>
          <h5 style={{ color: '#ffc107', marginTop: 0 }}>Feature Request</h5>
          <form onSubmit={triggerAgentLoop}>
            <textarea
              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#212529', color: '#fff', border: '1px solid #6c757d', borderRadius: '4px', padding: '10px', marginBottom: '15px' }}
              rows="6"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Write a python script to calculate the first 10 numbers of the Fibonacci sequence and print them as a list."
              disabled={loading}
            />
            <button 
              type="submit" 
              style={{ width: '100%', backgroundColor: '#198754', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              disabled={loading}
            >
              {loading ? 'Running Agent Loop...' : 'Compile & Heal Code'}
            </button>
          </form>
        </div>

        {/* Dashboard Panels */}
        <div style={{ flex: '2', minWidth: '450px' }}>
          {result && (
            <div style={{ padding: '12px', backgroundColor: '#2c3034', borderRadius: '6px', marginBottom: '15px', border: '1px solid #495057' }}>
              <strong>Status: </strong> 
              <span style={{ color: result.status.includes('Success') ? '#198754' : '#dc3545' }}>{result.status}</span>
              <span style={{ backgroundColor: '#0d6efd', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', marginLeft: '15px' }}>Iterations: {result.iterations}</span>
            </div>
          )}

          <div>
            <h6 style={{ color: '#0dcaf0', marginBottom: '5px' }}>📟 Live Terminal Sandbox & Self-Healing Tracebacks</h6>
            <pre style={{ backgroundColor: '#000', color: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #495057', maxHeight: '200px', overflowY: 'auto', fontFamily: 'Courier New' }}>
              {result ? result.terminal_logs : 'Awaiting prompt execution logs...'}
            </pre>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h6 style={{ color: '#ffc107', marginBottom: '5px' }}>📄 Final Verified Source File Output</h6>
            <pre style={{ backgroundColor: '#212529', color: '#198754', padding: '15px', borderRadius: '6px', border: '1px solid #495057', maxHeight: '250px', overflowY: 'auto' }}>
              <code>{result ? result.final_code : '# Verified Python file code will appear here after clean compilation.'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
