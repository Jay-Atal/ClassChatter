import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput.js';

export default function ChatApp() {
    const [messages, setMessages] = useState([]);

    const handleSendMessage = (text) => {
        if (text.trim()) {
            setMessages([...messages, { text, fromUser: true }]);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <ChatWindow messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
}
 