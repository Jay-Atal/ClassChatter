import React, { useState } from "react";
import { toast } from 'react-toastify';

export default function CodeInput({ join, host }) {
    const [roomCode, setRoomCode] = useState('');
    const [username, setUsername] = useState('');
    const [isJoining, setIsJoining] = useState(true);

    const handleJoin = () => {
        if (!roomCode.trim() || !username.trim()) {
            toast.error('Please enter both room code and username');
            return;
        }
        join(roomCode.trim(), username.trim());
    };

    const handleHost = () => {
        if (!username.trim()) {
            toast.error('Please enter a username');
            return;
        }
        host(username.trim());
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            isJoining ? handleJoin() : handleHost();
        }
    };

    return (
        <div className="welcome-container">
            <div className="welcome-card">
                <h1>Class Chatter</h1>
                <p className="welcome-subtitle">
                    {isJoining ? 
                        "Join a discussion room" : 
                        "Create a new room"}
                </p>
                
                <div className="input-stack">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your name"
                            onKeyPress={handleKeyPress}
                            autoFocus
                        />
                    </div>

                    {isJoining && (
                        <div className="input-group">
                            <label htmlFor="roomcode">Room Code</label>
                            <input
                                id="roomcode"
                                type="text"
                                className="input-field"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                placeholder="Enter room code"
                                onKeyPress={handleKeyPress}
                            />
                        </div>
                    )}
                </div>

                <div className="button-stack">
                    <button 
                        onClick={isJoining ? handleJoin : handleHost}
                        className="primary-button"
                    >
                        {isJoining ? 'Join Room' : 'Create Room'}
                    </button>
                    
                    <button 
                        onClick={() => setIsJoining(!isJoining)} 
                        className="secondary-button"
                    >
                        {isJoining ? 'Create a Room Instead' : 'Join a Room Instead'}
                    </button>
                </div>
            </div>
        </div>
    );
}