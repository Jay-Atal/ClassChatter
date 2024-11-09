import React, { useState } from 'react';

export default function UpvoteButton({ fromUser, onUpvote }) {
    const [upvoteCount, setUpvoteCount] = useState(0);

    const handleUpvoteClick = () => {
        const newCount = upvoteCount + 1;
        setUpvoteCount(newCount);
        onUpvote(newCount)
    };

    return (
        <span 
            onClick={handleUpvoteClick}
            style={{
                position: 'absolute',
                top: '50%',
                left: fromUser ? '-35px' : '100%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: '20px',
                color: upvoteCount > 0 ? '#007bff' : '#888'
            }}
        >
            👍 {upvoteCount > 0 && <span>{upvoteCount}</span>}
        </span>
    );
}
