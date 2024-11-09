import uuid

import bson
# from flask_pymongo import PyMongo
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", transport=['websocket'])

rooms = {}


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
    pass
    room_id = str(uuid.uuid4())  # Generate a unique room ID
    host_id = request.sid
    new_room = Room(room_id, host_id)  # Create a new room with an empty message list (you can store messages in DB)
    new_room.connected_users.add(host_id)  # Add the host to the room
    join_room(room_id)  # Join the new room
    emit('message', f'Room {room_id} created. You are now the host.', room=room_id)


# SocketIO event for joining an existing room
@socketio.on('join')
def on_join(room):
    pass
    # if room in rooms:  # Check if the room exists
    #     join_room(room)  # Join the room
    #     emit('message', f'You have joined the room {room}', room=room)
    # else:
    #     emit('message', f'Room {room} does not exist.', room=request.sid)


# SocketIO event for receiving a message
@socketio.on('message')
def handle_receive_message(msg):
    print(f"Received message: {msg}")
    # # Get the room and message data (ensure 'room' and 'message' keys exist in msg)
    # room = msg.get('room')
    # message = msg.get('message')
    #
    # if room and message:
    #     emit('message', {'text': message}, room=room)  # Broadcast message to the room


# SocketIO event for upvoting (or other custom actions)
@socketio.on('upvote')
def handle_upvote(data):
    print(f"Received upvote: {data}")
    # post_id = data.get('post_id')
    # if post_id:
    #     emit('new_message', {'post_id': post_id, 'action': 'upvoted'}, broadcast=True, include_self=False)


# Flask route for serving the chat session (for example, if using MongoDB)
@app.route('/get_messages', methods=['GET'])
def get_messages():
    # Placeholder for getting chat history from a DB like MongoDB
    # Use MongoDB PyMongo here to query messages by room or user
    pass


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
