import React, { useState, useCallback, useEffect } from 'react';
import SocketIO from 'socket.io-client';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput.js';
import CodeInput from './CodeInput.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// TODO: have roomId as parameter
export default function ChatApp() {
    const [messageTable, setMessageTable] = useState({});
    const [messageDisplay, setMessageDisplay] = useState([]);
    const [socket, setSocket] = useState(null);
    // should be null
    const [roomId, setRoomId] = useState("room_id")
    const [inRoom, setInRoom] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleMessageResponse = useCallback((data) => {
        const entry = {
            message: data.message,
            messageId: data.messageId,
            upvotes: data.upvotes,
            fromUser: data.fromUser,
        };
        setMessageTable((messageTable) => ({...messageTable, [data.messageId]: entry}));
        setMessageDisplay((messageDisplay) => [...messageDisplay, entry]);
        toast(data.message);
    }, [messageTable, messageDisplay]);

    const handleUpvoteResponse = useCallback((data) => {
        let entry = messageTable[data.messageId];
        if (entry) {
            entry.upvotes = data.upvotes
        }
    }, [messageTable, messageDisplay]);

  const handleJoinResponse = useCallback((data)=> {
        setInRoom(true);
        setRoomId(data.roomId);
    }, []);

  const handleHostResponse = useCallback((data)=> {
        setInRoom(true);
        setRoomId(data.roomId);
    }, []);


    useEffect(() => {
        const newSocket = SocketIO.connect('http://localhost:50000');
        setSocket(newSocket);
        newSocket.on('message', handleMessageResponse);
        newSocket.on('upvote', handleUpvoteResponse);
        newSocket.on('host', handleHostResponse)
        newSocket.on('join', handleJoinResponse)
        newSocket.on('popup', handleToast);
        newSocket.on('joinResponse', handleJoinResponse)
        return () => {
            newSocket.disconnect();
        };
    }, [handleMessageResponse, handleUpvoteResponse]);

    const handleSendMessage = (message) => {
        if (message.trim()) {
            socket.emit('message', {
                'roomId': roomId,
                'message': message,
            });
        }
    };

    const handleToast = (data) => {
        console.log("should be toast")
        toast(data);
    };

    const handleSendUpvote = (increment, metadata) => {
        socket.emit('upvote', {
            'roomId': roomId,
            'messageId': metadata.messageId,
            'increment': increment,
        });
    };

    const handleJoinRoom = () => {
        // setInRoom(true);
        socket.emit('join', {
        'roomId': inputValue,
        })
    };

    const handleHostRoom = () => {
        // setInRoom(true);
        socket.emit('host')
    };

    if (inRoom) {
        return (
            <><ToastContainer/>
            <div className="chat-container">
                <ChatWindow messages={messageDisplay} onUpvote={handleSendUpvote} />
                <MessageInput onSendMessage={handleSendMessage} />
            </div></>
        );
    } else {
        return (
            <>
                <ToastContainer/>
            <CodeInput join={handleJoinRoom} host={handleHostRoom} inputValue={inputValue} setInputValue={setInputValue} />
                </>
        );
    }
}
 