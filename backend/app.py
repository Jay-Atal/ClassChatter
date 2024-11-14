from __future__ import annotations
import uuid
from typing import Dict
import time

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, emit
from pymongo import MongoClient
from config import MONGO_URI
from sentence_transformers import SentenceTransformer
from collections import defaultdict
from bson.objectid import ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
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

    room_id = str(uuid.uuid4())[:4].upper()
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
    room_id = data.get('roomId').upper()
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

    # Store the message in single database with room_id field
    embedding = model.encode(message_content).tolist()
    database = client['database']  # Use single database
    message_collection = database['messages']
    
    message_document = {
        "message": message_content,
        "timestamp": time.time(),
        "username": username,
        "embedding": embedding,
        "room_id": room_id,  # Include room_id in document
        "upvotes": []
    }
    result = message_collection.insert_one(message_document)
    message_id = str(result.inserted_id)

    # Add to clusters
    add_message_to_cluster(room_id, message_content, message_id)

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
    # Broadcast to everyone in room
    emit('message', {**response, 'fromUser': False}, broadcast=True, include_self=False)
    emit('message', {**response, 'fromUser': True}, to=request.sid)

def add_message_to_cluster(room_id, query_text, message_id):
    # Use single database
    database = client['database']
    clusters_collection = database['clusters']
    messages_collection = database['messages']
    
    # Update pipeline to filter by room_id
    pipeline = [
        {
            "$search": {
                "index": "default",
                "text": {
                    "query": query_text,
                    "path": "message"
                }
            }
        },
        {
            "$match": {
                "room_id": room_id  # Filter messages by room_id
            }
        },
        {
            "$addFields": {
                "score": { "$meta": "searchScore" }
            }
        },
        {
            "$match": {
                "score": {"$gt": 0.8}
            }
        },
        {
            "$limit": 1
        }
    ]

    similar_message = list(messages_collection.aggregate(pipeline))

    try:
        if len(similar_message) == 0:
            clusters_collection.insert_one({
                "room_id": room_id,
                "clusters": [message_id]
            })
            print("Inserted new cluster with room_id:", room_id)
            return

        sim_message_id = str(similar_message[0].get("_id"))

        # Find cluster in the same room containing the similar message
        result = clusters_collection.find_one({
            "room_id": room_id,
            "clusters": { "$in": [sim_message_id] }
        })

        if result:
            # Update existing cluster
            clusters_collection.update_one(
                { 
                    "_id": result["_id"],
                    "room_id": room_id
                },
                { "$addToSet": { "clusters": message_id } }
            )
            print("Updated existing cluster with message_id:", message_id)
        else:
            # Create new cluster
            clusters_collection.insert_one({
                "room_id": room_id,
                "clusters": [sim_message_id, message_id]
            })
            print("Inserted new cluster with similar and current message IDs")

    except Exception as e:
        print("An error occurred:", e)

@socketio.on('upvote')
def handle_upvote(data):
    room_id = data.get('roomId')
    message_id = data.get('messageId')
    username = data.get('username')
    increment = data.get('increment')

    if not all([room_id, message_id, username]):
        return

    # Use the single database approach
    database = client['database']
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

@app.route('/api/clusters/<room_id>')
def get_clusters(room_id):
    try:
        database = client['database']
        clusters_collection = database['clusters']
        messages_collection = database['messages']
        
        print(f"Fetching clusters for room: {room_id}")
        
        # Get all clusters for this room
        room_clusters = list(clusters_collection.find({"room_id": room_id}))
        print(f"Found {len(room_clusters)} cluster documents for room {room_id}")
        
        response_clusters = []
        for cluster_doc in room_clusters:
            message_ids = cluster_doc.get('clusters', [])
            print(f"Processing cluster document with {len(message_ids)} messages")
            
            try:
                # Get all messages in this cluster document
                messages = list(messages_collection.find({
                    '_id': {'$in': [ObjectId(msg_id) for msg_id in message_ids]},
                    'room_id': room_id
                }))
                
                if messages:  # Only include clusters with valid messages
                    cluster_messages = []
                    total_upvotes = 0
                    
                    for msg in messages:
                        upvotes = len(msg.get('upvotes', []))
                        total_upvotes += upvotes
                        
                        cluster_messages.append({
                            'id': str(msg['_id']),
                            'text': msg['message'],
                            'username': msg.get('username', 'Anonymous'),
                            'upvotes': upvotes,
                            'timestamp': msg.get('timestamp', 0)
                        })
                    
                    # Sort messages within cluster by upvotes and timestamp
                    cluster_messages.sort(key=lambda x: (-x['upvotes'], -x['timestamp']))
                    
                    # Each cluster document becomes one box
                    response_clusters.append({
                        'id': str(cluster_doc['_id']),
                        'messages': cluster_messages,
                        'size': len(cluster_messages),
                        'total_upvotes': total_upvotes,
                        'is_single': len(cluster_messages) == 1  # Flag for single-message clusters
                    })
            except Exception as e:
                print(f"Error processing cluster document: {e}")
                continue
        
        # Sort clusters: multi-message clusters first, then by size and upvotes
        response_clusters.sort(key=lambda x: (-len(x['messages']), -x['total_upvotes']))
        
        print(f"Returning {len(response_clusters)} cluster boxes")
        return jsonify(response_clusters)
        
    except Exception as e:
        print(f"Error in get_clusters: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=50000, allow_unsafe_werkzeug=True)