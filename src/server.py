from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import csv
import time
import os

start = time.time()
app = Flask(__name__)
CORS(app)
socketio = SocketIO(
    app, cors_allowed_origins="*"
)  # Khởi tạo SocketIO với ứng dụng Flask của bạn

app.static_url_path = "/static"
app.static_folder = "../data/keyframes"

os.makedirs("./vectordb", exist_ok=True)
print("### | Initial model...")
from aic23_model import model

# print("### | Get detail keyframes...")
# with open("../data/detail_keyframes.json", "r") as json_file:
#     detail_keyframes = json.load(json_file)

print("### | Get all objects...")
objects = []
with open(f"../data/object_labels.csv", "r", newline="", encoding="utf-8") as file:
    csv_reader = csv.reader(file)
    next(csv_reader, None)

    for row in csv_reader:
        objects.append(row)

end = time.time()
print(
    f"Server initialization takes: {round(((end - start) / 60))}m {round((int(end - start) % 60))}s"
)


@app.route("/initial", methods=["GET"])
def initial():
    try:
        # Your processing logic goes here
        # For demonstration purposes, let's just echo the received data
        result = {"message": "successful", "detail_keyframes": [], "objects": objects}
        # Return a JSON response
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("search")
def search(message):
    try:
        query = message["searchQuery"].strip()
        audioQuery = message["searchAudioQuery"].strip()

        queries = [q.strip() for q in query.split("@")]
        audioQueries = [q.strip() for q in audioQuery.split("@")]
        topk = 500
        
        print(queries)
        print(audioQueries)
        if len(queries) == 1 or (len(queries) == 2 and queries[-1] == ""):
            print("Normal search")
            if audioQueries[0] == '' and len(audioQueries) == 1:
                results = model.search(
                    query_text=queries[0],
                    audio_texts=audioQueries[0],
                    topk=topk,
                )
            else: 
                results = model.search(
                    query_text=queries[0],
                    audio_texts=None,
                    topk=topk,
                )
                
        else:
            print("Sequence search")
            results = model.search_in_sequence(
                query_text_1=queries[0],
                query_text_2=queries[1],
                audio_texts=audioQueries,
                topk=topk,
            )
        # print(results.to_json())
        print(results.to_json())

        emit("search_result", {"data": results.to_json()}, broadcast=False)
    except Exception as e:
        emit("search_error", {"error": str(e)}, broadcast=False)


if __name__ == "__main__":
    print("<<<<<< SERVER RUN | http://localhost:5000 >>>>>>")
    socketio.run(app, debug=False, port=5000)
