import React from 'react';

export default function ClusterPanel({ clusters }) {
    return (
        <div className="cluster-panel">
            <h2>Similar Messages</h2>
            <div className="clusters-container">
                {clusters.map((cluster, index) => (
                    <div key={index} className="cluster-group">
                        <div className="cluster-header">
                            <span className="cluster-size">{cluster.size} messages</span>
                            <span className="cluster-upvotes">
                                {cluster.total_upvotes} <i className="fas fa-arrow-up"></i>
                            </span>
                        </div>
                        <div className="cluster-messages">
                            {cluster.messages.map((msg, msgIndex) => (
                                <div key={msgIndex} className="cluster-message">
                                    <p>{msg.text}</p>
                                    <span className="message-upvotes">
                                        {msg.upvotes} <i className="fas fa-arrow-up"></i>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 