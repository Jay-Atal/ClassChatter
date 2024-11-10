import React, { useState } from 'react';

export default function UpvoteButton({ metadata, onUpvote }) {
    const [upvoteCount, setUpvoteCount] = useState(0);
    const [isUpvoted,setisUpvoted] = useState(false);

    // use metadata instead for count
    const handleUpvoteClick = () => {
        metadata.message = "ayo????!?!??!!?!?"
        let newCount;
        if(!isUpvoted){
            newCount = upvoteCount + 1;
        }
        else{
            newCount = upvoteCount - 1;
        }
        setisUpvoted(!isUpvoted);
        setUpvoteCount(newCount);
        onUpvote(upvoteCount, isUpvoted);
    };

    return (
        <span 
            onClick={handleUpvoteClick}
            style={{
                position: 'absolute',
                top: '50%',
                left: metadata.fromUser ? '-35px' : '100%',
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
