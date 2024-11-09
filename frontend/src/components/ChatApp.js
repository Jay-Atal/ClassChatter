import React, { useState, useCallback, useEffect } from 'react';
import SocketIO from 'socket.io-client';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput.js';

// TODO: have roomId as parameter
export default function ChatApp() {
    const [messages, setMessages] = useState(new Map());
    const [socket, setSocket] = useState(null);
    const [roomId, setRoomId] = useState("room_id");

    const handleMessageResponse = useCallback((data) => {
        console.log('MessageResponse: ' + data.message);
    }, []);

    const handleUpvoteResponse = useCallback((data) => {
        console.log('UpvoteResponse: ' + data.message);
    }, []);

    useEffect(() => {
        const newSocket = SocketIO.connect('http://localhost:5000');
        setSocket(newSocket);
        newSocket.on('message', handleMessageResponse);
        newSocket.on('upvote', handleUpvoteResponse);
        return () => {
            newSocket.disconnect();
        };
    }, [handleMessageResponse, handleUpvoteResponse]);

    const handleSendMessage = (text) => {
        if (text.trim()) {
            console.log(text)
            socket.emit('message', {
                'room_id': roomId,
                'message': text,
            }, (response) => {
                // let messageId = response.messageId;
                let entry = {response, fromUser: true, };
                messages.set(1, entry);
            });
        }
    };

    const handleSendUpvote = (upvote, message) => {
        socket.emit('upvote', {
            'room_id': roomId,
            // 'message_id': message.messageId,
            'increment': !upvote.isUpvoted,
        })
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <ChatWindow messages={messages.values()} onUpvote={handleSendUpvote} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
}
 