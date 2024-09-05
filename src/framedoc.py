from const import *
import numpy as np
from docarray import DocList, BaseDoc
from docarray.typing import NdArray
import clip
from utils import (
    check_script,
    create_html_script,
    reformat_keyframe,
    reformat_object
)
import json as js
import pandas as pd
import os
from IPython.display import display, HTML
from tqdm import tqdm

# Change the file names for a consistent name format
reformat_keyframe()
reformat_object()


class TextEmbedding:
    def __init__(self):
        self.device = DEVICE
        self.model, _ = clip.load(MODEL, device=self.device)

    def __call__(self, text: str) -> np.ndarray:
        text_inputs = clip.tokenize([text]).to(self.device)
        with torch.no_grad():
            text_feature = self.model.encode_text(text_inputs)[0]
        return text_feature.detach().cpu().numpy()


class FrameDoc(BaseDoc):
    embedding: NdArray[512]
    video_name = ""
    image_path = ""
    keyframe_id = 0
    actual_idx = 0
    actual_time = 0.0
    fps = 0
    metadata = {}
    object_labels: list[dict] = [] 
    link = ""
    id_frame=""

    def __str__(self):
        return f"""
            Video name: {self.video_name}
            Image path: {self.image_path}
            Keyframe Id: {self.id_frame}
            Actual keyframe idx: {self.actual_idx}
            Time: {self.actual_time}
            FPS: {self.fps}
            Metadata: {self.metadata}
            Object Labels: {self.object_labels}
          """


class FrameDocs:
    doc_list = []

    def __init__(self, doc_list) -> None:
        self.doc_list = doc_list.copy()

    def __call__(self):
        return self.doc_list.copy()

    def __len__(self) -> int:
        return len(self.doc_list)
        
    def contains_v1(self, keywords = None):
        """
        Filter FrameDoc by keywords in transcript (Naive approach)
        """
        doc_list = self.doc_list.copy()
        if keywords:
            keywords = [kw.lower() for kw in keywords]
            for i in range(len(doc_list) - 1, -1, -1):
                transcript_path = SCRIPT_PATH + doc_list[i].video_name + ".txt"
                try:
                    with open(transcript_path, "r", encoding="utf-8") as file:
                        content = file.read()
                        if not check_script(content, keywords):
                            doc_list.pop(i)
                except FileNotFoundError:
                    pass
        return FrameDocs(doc_list=doc_list)

    def contains(self, keywords = None):  
        """
        Filter FrameDoc by keywords in transcript (Efficient approach)
        """
        doc_list = self.doc_list.copy()
        # Get list of unique videos
        videos = []
        for i in range(len(doc_list) - 1, -1, -1):
            videos.append(doc_list[i].video_name)
        videos = list(set(videos))
        # Read the transcript once for each video
        filtered_videos = []
        if keywords:
            keywords = [kw.lower() for kw in keywords]
            for video in videos:
                transcript_path = SCRIPT_PATH + video + ".txt"
                try:
                    with open(transcript_path, "r") as file:
                        content = file.read()
                        if check_script(content, keywords):
                            filtered_videos.append(video)
                except FileNotFoundError:
                    pass
            # Filter out frames that are not from a satisfied video        
            filtered_doc_list = []
            for i in range(len(doc_list) - 1, -1, -1):
                if doc_list[i].video_name in filtered_videos:
                    filtered_doc_list.append(doc_list[i])
            return FrameDocs(doc_list=filtered_doc_list)
        else:
            return FrameDocs(doc_list=doc_list)

    def to_json(self):
        json_frame = [
            {
                "l": doc.link,
                "v": doc.video_name,
                "i": doc.id_frame,
                "f": doc.actual_idx,
                "t": doc.actual_time,
                "o": doc.object_labels,
            }
            for doc in self.doc_list
        ]
        return json_frame

    def visualize(self):
        img_docs = [
            {
                "link": doc.metadata["watch_url"].split("v=")[-1],
                "path": doc.image_path,
                "video": doc.video_name,
                "frame": doc.actual_idx,
                "s": str(int(doc.actual_time) // 60)
                + "'"
                + str(round(doc.actual_time - 60 * (int(doc.actual_time) // 60), 1)),
            }
            for doc in self.doc_list
        ]

        display(HTML(create_html_script(img_docs)))

# Load all framedoc to memory (Old version, without object labels)
def get_all_docs(npy_files) -> FrameDocs:
    doc_list = []
    for feat_npy in tqdm(iterable=npy_files, ascii=True, desc="Loading FrameDocs"):
        video_name = feat_npy[feat_npy.find("L") :].split(".")[0]
        feats_arr = np.load(os.path.join(feat_npy))
        # Load metadata
        metadata = {}
        with open(os.path.join(METADATA_PATH, video_name + ".json"), encoding="utf-8") as meta_f:
            metadata = js.load(meta_f)
            map_kf = pd.read_csv(
                os.path.join(MAP_KEYFRAMES, video_name + ".csv"),
                usecols=["pts_time", "fps", "frame_idx"],
            )
            metadata = {key: metadata[key] for key in ["publish_date", "watch_url"]}
            for frame_idx, feat in enumerate(feats_arr):
                image_path = os.path.join(
                    KEYFRAME_PATH, video_name, f"{frame_idx + 1:04d}.jpg"
                )
                actual_idx = map_kf["frame_idx"][frame_idx]
                doc_list.append(
                    FrameDoc(
                        embedding=feat,
                        video_name=video_name,
                        image_path=image_path,
                        id_frame=str(frame_idx + 1),
                        actual_idx=actual_idx,
                        actual_time=map_kf["pts_time"][frame_idx],
                        fps=map_kf["fps"][frame_idx],
                        # metadata=metadata,
                        link=metadata["watch_url"],
                    )
                )
    return FrameDocs(doc_list)

# Load all framedoc to memory (New version)
def get_all_docs_v2() -> FrameDocs:
    doc_list = []
    with open("../data/detail_keyframes.json", "r", encoding="utf-8") as json_file:
        detail_keyframes = js.load(json_file)
    json_file.close()
    current_video = "L01_V001"
    features_frames = np.load("../data/features/" + current_video + ".npy")
    for idx, keyframe in enumerate(tqdm(detail_keyframes)):
        if keyframe["v"] not in ["L22_V023", "L22_V024", "L35_V005", "L18_V006", "L19_V048", "L20_V010"]:
            if keyframe["v"] != current_video:
                current_video = keyframe["v"]
                features_frames = np.load("../data/features/" + current_video + ".npy")
            id_frame = keyframe["i"]
            id =  int(keyframe["i"].lstrip('0'))
            doc_list.append(
                FrameDoc(
                    embedding=features_frames[id - 1],
                    link=keyframe["l"],
                    video_name=keyframe["v"],
                    id_frame=str(id_frame),
                    actual_idx=keyframe["f"],
                    actual_time=keyframe["t"],
                    object_labels=keyframe["o"],
                )
            )
    detail_keyframes.clear()
    return FrameDocs(doc_list)
