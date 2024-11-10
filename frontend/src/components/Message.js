import React, { useState } from 'react';
import UpvoteButton from './UpvoteButton.js';

export default function Message({ text, fromUser, onUpvote }) {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [hasUpvote, setHasUpvote] = useState(false);
    // const [messageId, setMessageId] = useState(none)

    const handleMouseEnter = () => setIsHighlighted(true);
    const handleMouseLeave = () => setIsHighlighted(false);

    const handleUpvote = (upvoteCount, isUpvoted) => {
        if (upvoteCount >= 1) {
            setHasUpvote(true);
        }
        else {
            setHasUpvote(false);
        }
        onUpvote(isUpvoted);
    };

    return (
        <div
            style={{ textAlign: fromUser ? 'right' : 'left' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={{
                display: 'inline-block',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: fromUser ? '#d1e7dd' : '#f8d7da',
                margin: '5px',
                position: 'relative'
            }}>
                {text}

                {(isHighlighted || hasUpvote) && (
                    <UpvoteButton fromUser={fromUser} onUpvote={handleUpvote} />
                )}
            </div>
        </div>
    );
}