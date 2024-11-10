from __future__ import annotations
import uuid
from typing import Dict
import datetime
import time

from flask import Flask, request
from flask_socketio import SocketIO, join_room, emit
from pymongo import MongoClient
from config import MONGO_URI
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", transport=['websocket'])

# Initialize sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

rooms: Dict[str, Room] = {}
rooms["msg_ids"] = 'a'



class Room:
    def __init__(self, room_id, host_id):
        self.room_id = room_id
        self.host_id = host_id
        self.connected_users = set()

client = MongoClient(MONGO_URI)

@app.route('/')
def hello():
    return 'Hello, World!'

@socketio.on('host')
def on_host():
    room_id = str(uuid.uuid4())
    host_id = request.sid
    new_room = Room(room_id, host_id)
    new_room.connected_users.add(host_id)
    join_room(room_id)
    socketio.emit('popup', {
        'message': f'Room {room_id} created. You are now the host.'
    }, to=room_id)

@socketio.on('join')
def on_join(room_id):
    if room_id in rooms:
        join_room(room_id)
        rooms[room_id].connected_users.add(room_id)
        socketio.emit('popup', f'You have joined the room {room_id}', to=request.sid)
    else:
        socketio.emit('popup', f'Room {room_id} does not exist.', to=request.sid)

def create_search_index(room_id):
    try:
        db = client[room_id]
        collection = db['messages']
        
        # Check if index exists
        existing_indexes = db.command("listSearchIndexes", "messages")
        if not any(index["name"] == "message_vector_index" for index in existing_indexes.get("indexes", [])):
            # Define Atlas Search index
            search_index = {
                "mappings": {
                    "dynamic": True,
                    "fields": {
                        "embedding": {
                            "dimensions": 384,
                            "similarity": "cosine",
                            "type": "knnVector"
                        }
                    }
                }
            }
            
            # Create the index
            db.command(
                "createSearchIndex",
                "messages",
                {
                    "name": "message_vector_index",
                    "definition": search_index
                }
            )
            print(f"Created vector search index for room {room_id}")
        else:
            print(f"Vector search index already exists for room {room_id}")
            
    except Exception as e:
        print(f"Error creating search index: {str(e)}")

@socketio.on('message')
def handle_receive_message(msg):
    print(f"Received message: {msg}")
    room_id = msg.get('roomId')
    message = msg.get('message')

    if not (room_id and message):
        return

    # Generate embedding for the message
    embedding = model.encode(message).tolist()
    
    # Store in MongoDB
    database = client['room_id']
    message_collection = database['messages']
    
    # Create search index if it doesn't exist
    
    message_document = {
        "message": message,
        "timestamp": datetime.datetime.fromtimestamp(time.time()),
        "user_id": request.sid,
        "embedding": embedding,
        "room_id": room_id,
        "upvotes": []
    }
    result = message_collection.insert_one(message_document)
    message_id = str(result.inserted_id)

    add_message_to_cluster(room_id, message, message_id)


    response = {'messageId': message_id, 'message': message, 'upvotes': 0}
    emit('message', {**response, 'fromUser': False}, broadcast=True, include_self=False)
    emit('message', {**response, 'fromUser': True}, to=request.sid)

@socketio.on('upvote')
def handle_upvote(data):
    print(f"Received upvote: {data}")
    room_id = data.get('roomId')
    message_id = data.get('messageId')
    increment = data.get('increment')

    if not (room_id and message_id):
        return

    # TODO: check database for upvote count and users, increment it,
    emit('upvote', {'messageId': message_id, 'upvotes': 10}, broadcast=True, include_self=False)
    emit('upvote', {'messageId': message_id, 'upvotes': 10}, to=request.sid)

# def add_message_to_cluster(room_id, query_text, message_id):
#     # Perform a similarity search in `messages` collection to find similar messages
#     clusters_collection = client["room_id"]["clusters"]
#     messages_collection = client["room_id"]["messages"]
#     pipeline = [
#         {
#             "$search": {
#                 "index": "default",
#                 "text": {
#                     "query": query_text,
#                     "path": "message"  # Field containing message text
#                 }
#             }
#         },
#         {
#             "$match": {
#                 "room_id": 'room_id'
#             }
#         },
#         {
#             "$addFields": {
#                 "score": { "$meta": "searchScore" }
#             }
#         },
#         {
#             "$match": {
#                 "score": { "$gt": 0.8 }  # Filter for score greater than 0.8
#             }
#         },
#         {
#             "$limit": 1  # Retrieve one similar message if it exists
#         }
#     ]
#     similar_message = list(messages_collection.aggregate(pipeline))
#     print(similar_message)
#     # Step 2: Check if similar message exists and is already in a cluster
#     if similar_message:
#         existing_message_id = similar_message[0]["_id"]

#         # Look for an existing cluster with this message ID
#         cluster = clusters_collection.find_one(
#             {
#                 "room_id": room_id,
#                 "clusters": {"$elemMatch": {"$in": [existing_message_id]}}
#             }
#         )

#         if cluster:
#             # Add the new message ID to the existing cluster
#             clusters_collection.update_one(
#                 {"room_id": room_id, "clusters": {"$elemMatch": {"$in": [existing_message_id]}}},
#                 {"$addToSet": {"clusters.$": message_id}}  # Adds the new ID only if it’s not already there
#             )
#             print("Added to existing cluster.")
#         else:
#             # Create a new cluster if the similar message is not in any cluster
#             clusters_collection.update_one(
#                 {"room_id": room_id},
#                 {"$push": {"clusters": [existing_message_id, message_id]}},
#                 upsert=True  # Create the room document if it doesn't exist
#             )
#             print("Created new cluster with similar message.")

#     # Step 3: Create a new cluster if no similar messages are found
#     else:
#         clusters_collection.update_one(
#             {"room_id": room_id},
#             {"$push": {"clusters": [message_id]}},
#             upsert=True
#         )
#         print("Created new cluster without similar messages.")
def add_message_to_cluster(room_id, query_text, message_id):
    # Collections for clusters and messages within the specified room
    clusters_collection = client['room_id']["clusters"]
    messages_collection = client['room_id']["messages"]
    
    # Step 1: Perform a similarity search in `messages_collection` to find similar messages
    pipeline = [
        {
            "$search": {
                "index": "default",
                "text": {
                    "query": query_text,
                    "path": "message"  # Field containing message text
                }
            }
        },
        {
            "$match": {
                "room_id": 'room_id'
            }
        },
        {
            "$addFields": {
                "score": { "$meta": "searchScore" }
            }
        },
        {
            "$match": {
                "score": { "$gt": 0.35 }  # Filter for score greater than 0.8
            }
        },
        {
            "$limit": 1  # Retrieve one similar message if it exists
        }
    ]
    # similar_message = messages_collection.aggregate(pipeline)
    # # for message in similar_message:
    # #     print(message)
    # try:
    #     if len(list(similar_message)) < 1:
    #         clusters_collection.insert_one({
    #         "room_id": room_id,
    #         "clusters": [message_id]
    #         })
    #         print(len(list(similar_message)))
    #         return
    # except:
    #     pass
    # sim_message_id = list(similar_message)[0].get("_id")
    # result = clusters_collection.find_one({ "clusters": { "$in": [sim_message_id] } })
    
    # if result:
    #     clusters_collection.update_one(
    #         { "_id": result["_id"] },
    #         { "$addToSet": { "clusters": message_id } }
    #     )
    # else:
    #     clusters_collection.insert_one({
    #         "room_id": room_id,
    #         "clusters": [sim_message_id, message_id]
    #     })

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

        result = clusters_collection.find_one({ "clusters": { "$in": [sim_message_id] } })

        if result:
            # Update the existing cluster to add the current message_id
            clusters_collection.update_one(
                { "_id": result["_id"] },
                { "$addToSet": { "clusters": message_id } }
            )
            print("Updated existing cluster with message_id:", message_id)
        else:
            clusters_collection.insert_one({
                "room_id": room_id,
                "clusters": [sim_message_id, message_id]
            })
            print("Inserted new cluster with similar and current message IDs")

    except Exception as e:
        print("An error occurred:", e)

        
        
    


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=50000, allow_unsafe_werkzeug=True)
