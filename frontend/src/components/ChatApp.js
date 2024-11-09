import React, { useState } from 'react';

export default function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            setMessages([...messages, { text: inputValue, fromUser: true }]);
            setInputValue('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.fromUser ? 'right' : 'left' }}>
                        <div style={{ display: 'inline-block', padding: '10px', borderRadius: '5px', backgroundColor: msg.fromUser ? '#d1e7dd' : '#f8d7da', margin: '5px' }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type message here"
                style={{ width: 'calc(100% - 100px)', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button onClick={handleSendMessage} style={{ padding: '10px', marginLeft: '10px', borderRadius: '5px' }}>
                Send
            </button>
        </div>
    );
} 