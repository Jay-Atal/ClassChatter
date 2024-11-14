import React, { useState, useCallback, useEffect } from 'react';
import SocketIO from 'socket.io-client';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput.js';
import CodeInput from './CodeInput.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClusterPanel from './ClusterPanel';

// TODO: have roomId as parameter
export default function ChatApp() {
    const [messageTable, setMessageTable] = useState({});
    const [messageDisplay, setMessageDisplay] = useState([]);
    const [socket, setSocket] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [username, setUsername] = useState(null);
    const [inRoom, setInRoom] = useState(false);
    const [showRoomInfo, setShowRoomInfo] = useState(true);
    const [clusters, setClusters] = useState([]);

    const handleMessageResponse = useCallback((data) => {
        console.log("Received message:", data); // Debug log
        
        // Create message entry with all necessary fields
        const entry = {
            message: data.message,
            messageId: data.messageId,
            username: data.username,
            timestamp: data.timestamp,
            upvotes: data.upvotes || 0,
            upvotedBy: data.upvotedBy || [],
            hasUpvoted: (data.upvotedBy || []).includes(username),
            fromUser: data.username === username,
            roomId: data.roomId
        };

        // Only process messages for the current room
        if (entry.roomId === roomId) {
            console.log("Processing message for room:", roomId);
            setMessageTable(prev => {
                // Only add if message doesn't exist
                if (!prev[entry.messageId]) {
                    console.log("Adding new message to table");
                    return {...prev, [entry.messageId]: entry};
                }
                return prev;
            });

            setMessageDisplay(prev => {
                // Only add if message isn't already displayed
                if (!prev.find(msg => msg.messageId === entry.messageId)) {
                    console.log("Adding new message to display");
                    return [...prev, entry];
                }
                return prev;
            });
        }
    }, [username, roomId]);

    const handleUpvoteResponse = useCallback((data) => {
        console.log("Received upvote:", data); // Debug log

        const updateMessage = (msg) => ({
            ...msg,
            upvotes: data.upvotes,
            upvotedBy: data.upvotedBy,
            hasUpvoted: data.upvotedBy.includes(username)
        });

        // Update both states atomically
        setMessageTable(prev => ({
            ...prev,
            [data.messageId]: updateMessage(prev[data.messageId])
        }));

        setMessageDisplay(prev => 
            prev.map(msg => 
                msg.messageId === data.messageId 
                    ? updateMessage(msg)
                    : msg
            )
        );
    }, [username]);

    const handleJoinResponse = useCallback((data) => {
        setRoomId(data.roomId);
        setUsername(data.username);
        setInRoom(true);
        toast.success(data.message);
    }, []);

    const handleJoinError = useCallback((data) => {
        toast.error(data.message);
    }, []);

    const handleMessageError = useCallback((data) => {
        toast.error(data.message);
    }, []);

    const handleHostResponse = ((data)=> {
        setInRoom(true)
    });

    const handleRoomCreated = useCallback((data) => {
        setRoomId(data.roomId);
        setUsername(data.username);
        setShowRoomInfo(true);
        setInRoom(true);
        toast.success(data.message);
    }, []);

    useEffect(() => {
        const newSocket = SocketIO.connect(`${window.location.protocol}//${window.location.hostname}:50000`);

        setSocket(newSocket);

        newSocket.on('message', handleMessageResponse);
        newSocket.on('upvote', handleUpvoteResponse);
        newSocket.on('room_created', handleRoomCreated);
        newSocket.on('room_joined', handleJoinResponse);
        newSocket.on('join_error', handleJoinError);
        newSocket.on('message_error', handleMessageError);

        return () => {
            if (newSocket) {
                newSocket.off('message');
                newSocket.off('upvote');
                newSocket.off('room_created');
                newSocket.off('room_joined');
                newSocket.off('join_error');
                newSocket.off('message_error');
                newSocket.disconnect();
            }
        };
    }, [handleMessageResponse, handleUpvoteResponse, handleRoomCreated, handleJoinResponse, handleJoinError, handleMessageError]);

    const handleSendMessage = (message) => {
        if (message.trim()) {
            const messageData = {
                'roomId': roomId,
                'username': username,
                'message': message,
            };
            console.log("Sending message:", messageData); // Debug log
            socket.emit('message', messageData);
        } else {
            toast.warn('Message cannot be empty.');
        }
    };

    const handleSendUpvote = (increment, metadata) => {
        console.log("Sending upvote:", {increment, metadata}); // Debug log
        socket.emit('upvote', {
            'roomId': roomId,
            'messageId': metadata.messageId,
            'username': username,
            'increment': increment,
        });
    };

    const handleLeaveRoom = () => {
        if (socket && roomId && username) {
            socket.emit('leave_room', {
                roomId: roomId,
                username: username
            });
            setInRoom(false);
            setRoomId(null);
            setUsername(null);
            setMessageDisplay([]);
            setMessageTable({});
        }
    };

    const handleJoinRoom = (roomId, username) => {
        if (!roomId.trim() || !username.trim()) {
            toast.error('Please enter both room code and username');
            return;
        }
        if (socket) {
            socket.emit('join', { 
                roomId: roomId.trim(),
                username: username.trim()
            });
        } else {
            toast.error('Socket connection not established');
        }
    };

    const handleHostRoom = (username) => {
        if (!username.trim()) {
            toast.error('Please enter a username');
            return;
        }
        if (socket) {
            socket.emit('host', { username: username.trim() });
        } else {
            toast.error('Socket connection not established');
        }
    };

    // Fetch clusters periodically
    useEffect(() => {
        if (!roomId || !inRoom) return;

        const fetchClusters = async () => {
            try {
                console.log("Fetching clusters for room:", roomId);
                const response = await fetch(`${window.location.protocol}//${window.location.hostname}:50000/api/clusters/${roomId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Received clusters data:", data);
                setClusters(data);
            } catch (error) {
                console.error('Error fetching clusters:', error);
            }
        };

        // Initial fetch
        fetchClusters();

        // Set up polling
        const interval = setInterval(fetchClusters, 5000);

        // Cleanup
        return () => clearInterval(interval);
    }, [roomId, inRoom]);

    if (inRoom) {
        return (
            <div className="app-layout">
                <div className="room-info-banner">
                    <div className="room-info">
                        <span>Room: <span className="room-key">{roomId}</span></span>
                        <span>Username: <span className="username">{username}</span></span>
                    </div>
                    <button onClick={handleLeaveRoom} className="leave-room-button">
                        Leave Room
                    </button>
                </div>
                <div className="main-content">
                    <div className="chat-container">
                        <ChatWindow messages={messageDisplay} onUpvote={handleSendUpvote} />
                        <MessageInput onSendMessage={handleSendMessage} />
                    </div>
                    <ClusterPanel clusters={clusters} />
                </div>
            </div>
        );
    } else {
        return (
            <CodeInput join={handleJoinRoom} host={handleHostRoom} />
        );
    }
}
 