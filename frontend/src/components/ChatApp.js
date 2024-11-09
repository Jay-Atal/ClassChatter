import React, { useState, useCallback, useEffect } from 'react';
import SocketIO from 'socket.io-client';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput.js';
import Codeinput from './codeinput.js';

export default function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [inRoom,setInRoom] = useState(false);

    const handleMessageResponse = useCallback((data) => {
        console.log('MessageResponse: ' + data.message);
    }, [])

    const handleUpvoteResponse = useCallback((data) => {
        console.log('UpvoteResponse: ' + data.message);
    }, [])

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
            setMessages([...messages, { text, fromUser: true }]);
            socket.emit('message', {
                'message': text,
            })
        }
    };

    const handleSendUpvote = (count, increment) => {
        socket.emit('upvote', {

        })
    }

    const handleJoinRoom = ()=>{
        setInRoom(true)
    }

    if(inRoom){
    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <ChatWindow messages={messages} onUpvote={handleSendUpvote} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
    }
    else{
        return(
            <Codeinput updater={handleJoinRoom}/>
        );
    }
}
 