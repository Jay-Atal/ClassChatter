import React, { useState } from 'react';

export default function ClusterPanel({ clusters }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedCluster, setExpandedCluster] = useState(null);

    if (isCollapsed) {
        return (
            <div className="cluster-panel collapsed">
                <button 
                    className="collapse-button" 
                    onClick={() => setIsCollapsed(false)}
                    title="Show similar messages"
                >
                    <i className="fas fa-layer-group"></i>
                    {clusters.length > 0 && (
                        <span className="cluster-count">{clusters.length}</span>
                    )}
                </button>
            </div>
        );
    }

    const handleClusterClick = (clusterId) => {
        setExpandedCluster(expandedCluster === clusterId ? null : clusterId);
    };

    return (
        <div className="cluster-panel">
            <div className="cluster-panel-header">
                <h2>Message Clusters {clusters.length > 0 && `(${clusters.length})`}</h2>
                <button 
                    className="collapse-button"
                    onClick={() => setIsCollapsed(true)}
                    title="Hide panel"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
            <div className="clusters-container">
                {clusters.length === 0 ? (
                    <div className="no-clusters">
                        No similar messages yet
                    </div>
                ) : (
                    clusters.map((cluster) => (
                        <div 
                            key={cluster.id} 
                            className={`cluster-box ${expandedCluster === cluster.id ? 'expanded' : ''}`}
                            onClick={() => handleClusterClick(cluster.id)}
                        >
                            <div className="cluster-box-header">
                                <div className="cluster-info">
                                    <span className="cluster-size">
                                        {cluster.size} similar message{cluster.size !== 1 ? 's' : ''}
                                    </span>
                                    <span className="cluster-upvotes">
                                        {cluster.total_upvotes} <i className="fas fa-arrow-up"></i>
                                    </span>
                                </div>
                                <i className={`fas fa-chevron-${expandedCluster === cluster.id ? 'up' : 'down'}`}></i>
                            </div>
                            {expandedCluster === cluster.id && (
                                <div className="cluster-messages">
                                    {cluster.messages.map((msg) => (
                                        <div key={msg.id} className="cluster-message">
                                            <div className="message-header">
                                                <span className="message-username">{msg.username}</span>
                                                <span className="message-upvotes">
                                                    {msg.upvotes} <i className="fas fa-arrow-up"></i>
                                                </span>
                                            </div>
                                            <p className="message-text">{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 