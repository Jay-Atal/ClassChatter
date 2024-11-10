import React, { useEffect, useRef } from 'react';
import Message from './Message';

export default function ChatWindow({ messages, onUpvote }) {
    const messagesEndRef = useRef(null);
    const chatWindowRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            const chatWindow = chatWindowRef.current;
            const isScrolledToBottom = chatWindow.scrollHeight - chatWindow.clientHeight <= chatWindow.scrollTop + 100;
            
            if (isScrolledToBottom) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

    return (
        <div className="chat-window" ref={chatWindowRef}>
            <div className="messages-container">
                {messages.map((metadata, index) => (
                    <Message 
                        key={metadata.messageId || index} 
                        metadata={metadata} 
                        onUpvote={onUpvote}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
