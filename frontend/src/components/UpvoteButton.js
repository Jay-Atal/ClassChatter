import React, { useState } from 'react';

export default function UpvoteButton({ metadata, onUpvote }) {
    const [isUpvoted,setisUpvoted] = useState(false);

    // use metadata instead for count
    const handleUpvoteClick = () => {
        // let newCount;
        // if(!isUpvoted){
        //     newCount = upvoteCount + 1;
        // }
        // else{
        //     newCount = upvoteCount - 1;
        // }
        // setUpvoteCount(newCount);
        setisUpvoted(!isUpvoted);
        onUpvote(!isUpvoted);
    };

    return (
        <span 
            onClick={handleUpvoteClick}
            style={{
                position: 'absolute',
                top: '50%',
                left: metadata.upvotes ? '-35px' : '100%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: '20px',
                color: metadata.upvotes > 0 ? '#007bff' : '#888'
            }}
        >
            👍 {metadata.upvotes > 0 && <span>{metadata.upvotes}</span>}
        </span>
    );
}
