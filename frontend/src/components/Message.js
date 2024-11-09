import React from 'react';

export default function Message({ text, fromUser }) {
    return (
        <div style={{ textAlign: fromUser ? 'right' : 'left' }}>
            <div style={{
                display: 'inline-block',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: fromUser ? '#d1e7dd' : '#f8d7da',
                margin: '5px'
            }}>
                {text}
            </div>
        </div>
    );
}
