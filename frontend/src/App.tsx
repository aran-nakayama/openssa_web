import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface ApiResponse {
  message: string;
}

function App() {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>('/api/hello');
        setMessage(response.data.message);
      } catch (err) {
        setError('APIの呼び出しに失敗しました');
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + FastAPI Application</h1>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <p>{message || 'Loading...'}</p>
        )}
      </header>
    </div>
  );
}

export default App;
