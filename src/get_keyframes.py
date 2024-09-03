import cv2
from const import *
import os
import pandas as pd
from tqdm import tqdm
import natsort

video_name = "L01_V001"


def get_all_video_name(list_name=None):
    if not list_name:
        return natsort(
            [
                name.replace(".mp4", "")
                for name in os.listdir(VIDEOS_PATH)
                if name != ".gitkeep"
            ]
        )
    return [
        name.replace(".mp4", "")
        for name in os.listdir(VIDEOS_PATH)
        if name != ".gitkeep" and int(name[1:3]) in list_name
    ]


def getMoreFramesInOneVideo(video_name: str, step=30, compression_quality=70):
    video_path = os.path.join(VIDEOS_PATH, video_name + ".mp4")
    video_map_keyframes_path = os.path.join(MAP_KEYFRAMES, video_name + ".csv")
    video_keyframes_dir = os.path.join(KEYFRAME_PATH, video_name)
    # video_keyframes_paths = [os.path.join(video_keyframes_dir, name) for name in os.listdir(video_keyframes_dir)]
    map_kfs = pd.read_csv(video_map_keyframes_path)
    fps = map_kfs["fps"][0]
    nb_old_frames, nb_new_frames = len(map_kfs), len(map_kfs)
    # Capture video
    video = cv2.VideoCapture(video_path)
    # Set video fps
    video.set(cv2.CAP_PROP_POS_FRAMES, fps)
    # Check if the video file opened successfully
    if not video.isOpened():
        print("Error: Could not open video file.")
        exit()
    max_frame_number = map_kfs["frame_idx"][len(map_kfs) - 1]
    frame_idxs = []
    for i in range(0, len(map_kfs) - 1):
        frame_idxs += list(
            range(map_kfs["frame_idx"][i] + step, map_kfs["frame_idx"][i + 1], step)
        )
    j = 0
    # Read and discard frames until you reach the desired frame
    for i in tqdm(range(max_frame_number)):
        ret, frame = video.read()
        if ret and j < len(frame_idxs) and i == frame_idxs[j]:
            j += 1
            nb_new_frames += 1
            n = int(map_kfs["n"][len(map_kfs) - 1]) + 1
            # Save the frame as a JPEG image
            image_filename = os.path.join(video_keyframes_dir, f"{n:04d}.jpg")
            if (
                isinstance(compression_quality, int)
                and compression_quality >= 50
                and compression_quality <= 100
            ):
                cv2.imwrite(
                    image_filename,
                    frame,
                    [int(cv2.IMWRITE_JPEG_QUALITY), compression_quality],
                )
            else:
                cv2.imwrite(image_filename, frame)

            # print(f"Frame {i} saved as {image_filename}.")
            # Add to Data frame
            map_kfs.loc[len(map_kfs.index)] = [n, round(i / fps, 2), fps, i]
        elif not ret:
            print(f"An error has occured while read frame...")
            video.release()
            exit()
    # Release the video file
    video.release()
    map_kfs["n"] = map_kfs["n"].astype(int)
    map_kfs["frame_idx"] = map_kfs["frame_idx"].astype(int)
    map_kfs.to_csv(video_map_keyframes_path, index=0)
    return nb_old_frames, nb_new_frames


def getMoreFrames(video_list):
    for video in tqdm(video_list):
        getMoreFramesInOneVideo(video_name=video)


if __name__ == "__main__":
    # L01 -> L05
    video_names = get_all_video_name([3,4,5])
    print(video_names)
