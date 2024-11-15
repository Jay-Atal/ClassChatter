import React, { useEffect, useRef } from 'react';
import Message from './Message';

export default function ChatWindow({ messages, onUpvote }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="chat-window">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 'auto'
            }}>
                {messages.map((metadata, index) => (
                    <Message key={index} metadata={metadata} onUpvote={onUpvote} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
