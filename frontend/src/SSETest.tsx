import React, { useState, useEffect } from 'react';

function SSETest() {
    const [messages, setMessages] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const connectToSSE = () => {
        setIsConnected(true);
        const eventSource = new EventSource('/api/sse-test');

        eventSource.onmessage = (event) => {
            setMessages(prev => [...prev, event.data]);
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
            setIsConnected(false);
        };

        // 10秒後に接続を閉じる
        setTimeout(() => {
            eventSource.close();
            setIsConnected(false);
        }, 11000);
    };

    return (
        <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
            <h2>SSEテスト</h2>
            <button 
                onClick={connectToSSE}
                disabled={isConnected}
            >
                {isConnected ? '接続中...' : 'SSE接続開始'}
            </button>
            <div style={{ marginTop: '20px' }}>
                <h3>受信メッセージ:</h3>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
        </div>
    );
}

export default SSETest; 