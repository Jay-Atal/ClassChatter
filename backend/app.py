from __future__ import annotations
import uuid
from typing import Dict

import bson
# from flask_pymongo import PyMongo
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", transport=['websocket'])


rooms: Dict[str, Room] = {}
rooms["msg_ids"] = 'a'

class Room:
    def __init__(self, room_id, host_id):
        self.room_id = room_id
        self.host_id = host_id
        self.connected_users = set()


@app.route('/')
def hello():
    return 'Hello, World!'


# SocketIO event for creating a room (host)
@socketio.on('host')
def on_host():
    room_id = str(uuid.uuid4())  # Generate a unique room ID
    host_id = request.sid
    new_room = Room(room_id, host_id)  # Create a new room with an empty message list (you can store messages in DB)
    new_room.connected_users.add(host_id)  # Add the host to the room
    join_room(room_id)  # Join the new room
    socketio.emit('popup', {
        'message': f'Room {room_id} created. You are now the host.'
    }, to=room_id)


# SocketIO event for joining an existing room
@socketio.on('join')
def on_join(room_id):
    if room_id in rooms:  # Check if the room exists
        join_room(room_id)  # Join the room
        rooms[room_id].connected_users.add(room_id)
        socketio.emit('popup', f'You have joined the room {room_id}', to=request.sid)
    else:
        socketio.emit('popup', f'Room {room_id} does not exist.', to=request.sid)


# SocketIO event for receiving a message
@socketio.on('message')
def handle_receive_message(msg):
    print(f"Received message: {msg}")
    room_id = msg.get('roomId')
    message = msg.get('message')

    if not (room_id and message):
        return

    # Make sure the user is in the room and the room exists
    # TODO: get rooms working
    # if room_id in rooms and request.sid in rooms[room_id].connected_users:
    #     message_id = rooms["msg_ids"]
    #     emit('message', {
    #         'message': message, 'fromUser': True, 'messageId': message_id
    #     }, to=request.sid)
    #     emit('message', {
    #         'message': message, 'fromUser': False, 'messageId': message_id
    #     }, to=room_id, skip_sid=request.sid)
    # else:
    #     emit('popup', f'Message failed to send.', to=request.sid)

    emit('message', {'messageId': rooms['msg_ids'], 'message': message}, broadcast=True)
    rooms['msg_ids'] += 'a'
    print(rooms)


# SocketIO event for upvoting (or other custom actions)
@socketio.on('upvote')
def handle_upvote(data):
    print(f"Received upvote: {data}")
    room_id = data.get('roomId')
    message_id = data.get('messageId')
    upvoted = data.get('upvoted')

    if not (room_id and message_id):
        return

    # TODO: check database for upvote count and users, increment it,
    emit('message', {'messageId': message_id, 'upvotes': 100}, broadcast=True, include_self=False)


# Flask route for serving the chat session (for example, if using MongoDB)
@app.route('/get_messages', methods=['GET'])
def get_messages():
    # Placeholder for getting chat history from a DB like MongoDB
    # Use MongoDB PyMongo here to query messages by room or user
    pass


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=50000, allow_unsafe_werkzeug=True)
