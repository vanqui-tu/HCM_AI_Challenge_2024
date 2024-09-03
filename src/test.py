import os
import json
import csv
from tqdm import tqdm
import numpy as np

def get_detail_frames():
    list_dataset = []
    list_folder = os.listdir("./../data/keyframes")
    for _, folder in enumerate(tqdm(list_folder)):
        if folder == ".gitkeep":
            continue

        # TODO: Read map_keyframe
        map_keyframe = []
        with open(f"./../data/map-keyframes/{folder}.csv", 'r', newline="") as file:
            csv_reader = csv.reader(file)
            next(csv_reader, None)

            for row in csv_reader:
                map_keyframe.append(row)
        file.close()

        # TODO: Get link video
        with open(f"./../data/metadata/{folder}.json", 'r') as file:
            metadata = json.load(file)
        file.close()  


        folder_path = os.path.join("./../data/keyframes", folder)
        list_keyframes = os.listdir(folder_path)

        for idx, frame in enumerate(list_keyframes):
            frame_path = os.path.join(folder_path, frame)

            # TODO Check FPS 
            # if map_keyframe[idx][2] != "25.0":
            #     print(f"Video {folder}, Frame {frame}, FPS {map_keyframe[idx][2]}")

            # TODO Get object of frame if confidence > 0.4
            obj_path = frame_path.replace("keyframes", "objects")
            obj_path = obj_path.replace("jpg", "json")
            with open(f"./../data/objects/{folder}/{frame[:-4]}.json", 'r') as file:
                objects_data = json.load(file)
            file.close()    
            detection_class_labels = objects_data["detection_class_labels"]
            detection_scores = objects_data["detection_scores"]
            detection_class_entities = objects_data["detection_class_entities"]
            detection_boxes = objects_data["detection_boxes"]
            objects_data.clear()
            objects = []
            for i, score in enumerate(detection_scores):
                if float(score) < 0.4:
                    continue
                objects.append({
                    "s": score,                         # score
                    "i": detection_class_labels[i],     # id class
                    "n": detection_class_entities[i],   # name class
                    "b": detection_boxes[i],            # bbox
                })    

            obj_frame = {
                "l": metadata["watch_url"].split("=")[1],   # link video
                "v": folder,                                # video
                "fps": map_keyframe[idx][2],
                "i": frame[:-4],                            # id frame
                "t": map_keyframe[idx][1],                  # time
                "f": map_keyframe[idx][3],                  # frame matched
                "o": objects                                # objects
            }   
            list_dataset.append(obj_frame)
    
    with open("../data/test.json", "w") as json_file:
        json.dump(list_dataset, json_file)

if __name__ == "__main__":
    get_detail_frames()
