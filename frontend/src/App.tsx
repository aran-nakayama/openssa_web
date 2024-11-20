import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface SolveResponse {
  answer: string;
}

function App() {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useKnowledge, setUseKnowledge] = useState<boolean>(false);
  const [useProgramStore, setUseProgramStore] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setIsProcessing(true);
    setLogs([]); // ログをクリア
    setError(''); // エラーをクリア

    try {
      // APIパスに /api プレフィックスを追加
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',  // 明示的にJSONを要求
        },
        body: JSON.stringify({
          question,
          use_knowledge: useKnowledge,
          use_program_store: useProgramStore,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);

      // EventSourceのパスも修正
      const eventSource = new EventSource(
        `/api/solve/stream?question=${encodeURIComponent(question)}&use_knowledge=${useKnowledge}&use_program_store=${useProgramStore}`
      );

      eventSource.onmessage = (event) => {
        setLogs(prev => [...prev, event.data]);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
      };

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OpenSSA質問応答システム</h1>
        <form onSubmit={handleSubmit} className="question-form">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="質問を入力してください"
            rows={4}
            className="question-input"
          />
          <div className="options">
            <label>
              <input
                type="checkbox"
                checked={useKnowledge}
                onChange={(e) => setUseKnowledge(e.target.checked)}
              />
              知識ベースを使用
            </label>
            <label>
              <input
                type="checkbox"
                checked={useProgramStore}
                onChange={(e) => setUseProgramStore(e.target.checked)}
              />
              プログラムストアを使用
            </label>
          </div>
          <button type="submit" disabled={loading || !question}>
            {loading ? '処理中...' : '質問する'}
          </button>
        </form>
        
        {error && <p className="error-message">{error}</p>}
        
        {answer && (
          <div className="answer-container">
            <h2>回答:</h2>
            <p>{answer}</p>
          </div>
        )}
        
        {/* ログ表示エリア */}
        {isProcessing && (
          <div className="logs-container">
            <h3>処理状況:</h3>
            <pre>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
