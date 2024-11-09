import React from 'react';
import Message from './Message';

export default function ChatWindow({ messages, onUpvote }) {
    return (
        <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '10px' }}>
            {messages.map((msg, index) => (
                <Message key={index} text={msg.text} fromUser={msg.fromUser} onUpvote={onUpvote} />
            ))}
        </div>
    );
}
