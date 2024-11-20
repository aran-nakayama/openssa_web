import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + FastAPI Application</h1>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App; 