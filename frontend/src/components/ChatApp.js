import React, { useState, useCallback, useEffect } from 'react';
import SocketIO from 'socket.io-client';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput.js';
import CodeInput from './CodeInput.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// TODO: have roomId as parameter
export default function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    // should be null
    const [roomId, setRoomId] = useState("room_id")
    const [inRoom, setInRoom] = useState(false);

    const handleMessageResponse = useCallback((data) => {
        console.log('MessageResponse: ' + data.text);
        let entry = {text: data.text, fromUser: false};
        setMessages((messages) => [...messages, entry]);
        toast(data.text)
    }, []);

    useEffect(() => {
        const newSocket = SocketIO.connect(`${window.location.protocol}//${window.location.hostname}:50000`);
        setSocket(newSocket);
        newSocket.on('message', handleMessageResponse);
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleSendMessage = (text) => {
        if (text.trim()) {
            // Immediately add the message to the UI
            const newEntry = { text, fromUser: true };
            setMessages(prevMessages => [...prevMessages, newEntry]);
            
            // Send the message to the server
            socket.emit('message', {
                'room_id': roomId,
                'message': text
            });
        }
    };

    const handleSendUpvote = (isUpvoted) => {
        socket.emit('upvote', {
            'room_id': roomId,
            'increment': isUpvoted,
        })
    };

    const handleJoinRoom = () => {
        setInRoom(true);
    }

    const handleHostRoom = () => {
        setInRoom(true);
    }

    if(inRoom){
    return (
        <>
        <ToastContainer/>
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <ChatWindow messages={messages} onUpvote={handleSendUpvote} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
        </>
    );
    }
    else{
        return(
            < CodeInput join={handleJoinRoom} host={handleHostRoom} />
        );
    }
}
 