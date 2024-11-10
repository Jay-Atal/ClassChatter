import React, { useState } from 'react';
import UpvoteButton from './UpvoteButton.js';

// Slightly scuffed, has to reinitialize popup to update
export default function Message({ metadata, onUpvote }) {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [hasUpvote, setHasUpvote] = useState(false);

    const handleMouseEnter = () => setIsHighlighted(true);
    const handleMouseLeave = () => setIsHighlighted(false);

    // TODO: use metadata instead to count
    const handleUpvote = (increment) => {
        if (metadata.upvotes >= 1) {
            setHasUpvote(true);
        } else {
            setHasUpvote(false);
        }
        onUpvote(increment, metadata);
    };

    return (
        <div 
            className={`message-container ${metadata.fromUser ? 'message-container-user' : 'message-container-other'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`message ${metadata.fromUser ? 'message-user' : 'message-other'}`}>
                {metadata.message.trim()}
                {(isHighlighted || hasUpvote) && (
                    <div className="upvote-container">
                        <UpvoteButton metadata={metadata} onUpvote={handleUpvote} />
                    </div>
                )}
            </div>
        </div>
    );
}