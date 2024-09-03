from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import csv

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # Khởi tạo SocketIO với ứng dụng Flask của bạn

app.static_url_path = '/static'
app.static_folder = '../data/keyframes'

print("### | Initial model...")
from aic23_model import model

# print("### | Get detail keyframes...")
# with open("../data/detail_keyframes.json", "r") as json_file:
#     detail_keyframes = json.load(json_file)

print("### | Get all objects...")
objects = []
with open(f"../data/object_labels.csv", 'r', newline="") as file:
    csv_reader = csv.reader(file)
    next(csv_reader, None)

    for row in csv_reader:
        objects.append(row)

@app.route('/initial', methods=['GET'])
def initial():
    try:
        # Your processing logic goes here
        # For demonstration purposes, let's just echo the received data
        result = {"message": "successful", "detail_keyframes":[], "objects": objects}
        # Return a JSON response
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('search')
def search(message):
    try:
        query = message["searchQuery"].strip()
        queries = query.split("@")
        if(len(queries) == 1 or (len(queries)== 2 and queries[-1] == "")):
            results = model.search(
                query_text=queries[0],
                audio_texts=[],
                topk=100,
            ) 
        else:
            results = model.search_in_sequence(
                query_text1=queries[0],
                query_text2=queries[1],
                audio_texts=[],
                topk=100,
            ) 
        print(results.to_json())

        emit('search_result', {"data": results.to_json()}, broadcast=False)
    except Exception as e:
        emit('search_error', {"error": str(e)}, broadcast=False)

if __name__ == '__main__':
    print("<<<<<< SERVER RUN | http://localhost:5000 >>>>>>")
    socketio.run(app, debug=False, port=5000)
