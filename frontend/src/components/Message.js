import React, { useState } from 'react';
import UpvoteButton from './UpvoteButton.js';

export default function Message({ text, fromUser, onUpvote }) {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [hasUpvote, setHasUpvote] = useState(false);

    const handleMouseEnter = () => setIsHighlighted(true);
    const handleMouseLeave = () => setIsHighlighted(false);

    const handleUpvote = (upvoteCount, isUpvoted) => {
        if (upvoteCount >= 1) {
            setHasUpvote(true);
        } else {
            setHasUpvote(false);
        }
        onUpvote(isUpvoted);
    };

    return (
        <div 
            className={`message-container ${fromUser ? 'message-container-user' : 'message-container-other'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`message ${fromUser ? 'message-user' : 'message-other'}`}>
                {text.trim()}
                {(isHighlighted || hasUpvote) && (
                    <div className="upvote-container">
                        <UpvoteButton fromUser={fromUser} onUpvote={handleUpvote} />
                    </div>
                )}
            </div>
        </div>
    );
}