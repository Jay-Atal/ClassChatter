import React, { useState } from 'react';

export default function MessageInput({ onSendMessage }) {
    const [inputValue, setInputValue] = useState('');

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div style={{ display: 'flex' }}>
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
