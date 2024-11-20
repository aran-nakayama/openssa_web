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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post<SolveResponse>('/api/solve', {
        question,
        use_knowledge: false,
        use_program_store: false
      });
      setAnswer(response.data.answer);
    } catch (err) {
      setError('APIの呼び出しに失敗しました');
      console.error('Error calling API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI質問応答システム</h1>
        <form onSubmit={handleSubmit} className="question-form">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="質問を入力してください"
            rows={4}
            className="question-input"
          />
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
      </header>
    </div>
  );
}

export default App;
