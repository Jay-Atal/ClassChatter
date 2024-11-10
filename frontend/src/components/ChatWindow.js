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
        <div style={{ 
            height: '300px', 
            overflowY: 'scroll', 
            border: '1px solid #ccc', 
            marginBottom: '10px', 
            display: 'flex', 
            flexDirection: 'column',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none'
            }
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 'auto'
            }}>
                {messages.map((msg, index) => (
                    <Message key={index} text={msg.text} fromUser={msg.fromUser} onUpvote={onUpvote} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
