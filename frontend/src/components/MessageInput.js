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
        <div className="message-input-container">
            <input
                className="message-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type message here"
            />
            <button className="action-button" onClick={handleSendMessage}>
                Send
            </button>
        </div>
    );
}
