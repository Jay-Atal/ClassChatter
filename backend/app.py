from __future__ import annotations
import uuid
from typing import Dict
import time

from flask import Flask, request
from flask_socketio import SocketIO, join_room, leave_room, emit
from pymongo import MongoClient
from config import MONGO_URI
from sentence_transformers import SentenceTransformer
from collections import defaultdict
from bson.objectid import ObjectId

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", transport=['websocket'])

model = SentenceTransformer('all-MiniLM-L6-v2')

rooms: Dict[str, Room] = {}
active_usernames = set()  # Track active usernames

class Room:
    def __init__(self, room_id, host_username):
        self.room_id = room_id
        self.host_username = host_username
        self.connected_users = set()  # Set of usernames

client = MongoClient(MONGO_URI)

@socketio.on('host')
def on_host(data):
    username = data.get('username')
    if not username:
        emit('host_error', {'message': 'Username is required'})
        return
        
    if username in active_usernames:
        emit('host_error', {'message': 'Username is already in use'})
        return

    room_id = str(uuid.uuid4())[:8]
    new_room = Room(room_id, username)
    rooms[room_id] = new_room
    new_room.connected_users.add(username)
    active_usernames.add(username)
    join_room(room_id)
    
    emit('room_created', {
        'roomId': room_id,
        'username': username,
        'message': f'Room {room_id} created successfully!'
    })

@socketio.on('join')
def on_join(data):
    room_id = data.get('roomId')
    username = data.get('username')

    if not username:
        emit('join_error', {'message': 'Username is required'})
        return

    if username in active_usernames:
        emit('join_error', {'message': 'Username is already in use'})
        return

    if room_id in rooms:
        join_room(room_id)
        rooms[room_id].connected_users.add(username)
        active_usernames.add(username)
        
        emit('room_joined', {
            'roomId': room_id,
            'username': username,
            'message': f'Successfully joined room {room_id}'
        })
    else:
        emit('join_error', {'message': 'Room does not exist'})

@socketio.on('leave_room')
def on_leave_room(data):
    room_id = data.get('roomId')
    username = data.get('username')
    
    if room_id in rooms and username in rooms[room_id].connected_users:
        rooms[room_id].connected_users.remove(username)
        active_usernames.remove(username)
        leave_room(room_id)
        emit('room_left', {'message': f'Left room {room_id}'})

@socketio.on('message')
def handle_receive_message(data):
    room_id = data.get('roomId')
    username = data.get('username')
    message_content = data.get('message')

    print(f"Message attempt - Room: {room_id}, User: {username}, Message: {message_content}")

    if room_id not in rooms or username not in rooms[room_id].connected_users:
        print(f"User {username} not authorized to send messages in room {room_id}")
        emit('message_error', {
            'message': 'Not authorized to send messages in this room'
        })
        return

    # Store the message
    embedding = model.encode(message_content).tolist()
    database = client[room_id]
    message_collection = database['messages']
    
    message_document = {
        "message": message_content,
        "timestamp": time.time(),
        "username": username,
        "embedding": embedding,
        "room_id": room_id,
        "upvotes": []
    }
    result = message_collection.insert_one(message_document)
    message_id = str(result.inserted_id)

    # Create response with all necessary fields
    response = {
        'messageId': message_id,
        'message': message_content,
        'username': username,
        'timestamp': time.time(),
        'upvotes': 0,
        'upvotedBy': [],
        'roomId': room_id
    }

    print(f"Broadcasting message to room {room_id}")
    # Simple broadcast to everyone in room
    emit('message', {**response, 'fromUser': False}, broadcast=True, include_self=False)
    emit('message', {**response, 'fromUser': True}, to=request.sid)

@socketio.on('upvote')
def handle_upvote(data):
    room_id = data.get('roomId')
    message_id = data.get('messageId')
    username = data.get('username')
    increment = data.get('increment')

    if not all([room_id, message_id, username]):
        return

    database = client[room_id]
    message_collection = database['messages']
    
    message = message_collection.find_one({"_id": ObjectId(message_id)})
    if not message:
        return

    upvotes = set(message.get('upvotes', []))
    if increment:
        upvotes.add(username)
    else:
        upvotes.discard(username)

    # Update message with new upvotes
    message_collection.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"upvotes": list(upvotes)}}
    )

    # Emit upvote update to all users in room
    response = {
        'messageId': message_id,
        'upvotes': len(upvotes),
        'upvotedBy': list(upvotes),
        'hasUpvoted': username in upvotes
    }
    emit('upvote', response, room=room_id)

@socketio.on('disconnect')
def handle_disconnect():
    # Clean up will be handled by leave_room event
    pass

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=50000, allow_unsafe_werkzeug=True)