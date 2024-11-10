import React from 'react';

export default function UpvoteButton({ metadata, onUpvote }) {
    const handleUpvoteClick = () => {
        onUpvote(!metadata.hasUpvoted, metadata);
    };

    return (
        <div className="upvote-button">
            <button 
                onClick={handleUpvoteClick}
                className={`upvote-icon ${metadata.hasUpvoted ? 'upvoted' : ''}`}
                title={metadata.upvotedBy?.length > 0 ? `Upvoted by: ${metadata.upvotedBy.join(', ')}` : ''}
            >
                <i className="fas fa-arrow-up"></i>
            </button>
            {metadata.upvotes > 0 && (
                <span className="upvote-count" title={`Upvoted by: ${metadata.upvotedBy?.join(', ')}`}>
                    {metadata.upvotes}
                </span>
            )}
        </div>
    );
}
