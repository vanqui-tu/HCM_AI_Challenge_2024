# IMPORT
import os
import shutil
from const import *
import re
import json as js
import pandas as pd
from tqdm import tqdm
import json


def filter_by_detail_scripts(keyword=""):
    list_scripts = []
    list_file = os.listdir("../data/scripts/")
    for file in list_file:
        if not "json" in file:
            continue

        times = []
        file_path = os.path.join("../data/scripts/", file)
        with open(file_path, "r", encoding="utf-8") as json_file:
            data = js.load(json_file)
        json_file.close()
        for line in data:
            if keyword.strip() != "" and keyword.strip() in line["text"]:
                start = (
                    str(int(line["start"]) // 60)
                    + "'"
                    + str(round(line["start"] - 60 * (int(line["start"]) // 60), 1)),
                )
                times.append(start)

        # TODO Object có dạng
        """
            "link": 
            "path": 
            "video": 
            "frame": 
            "s": 
        """
        if len(times) != 0:
            with open("../data/metadata/" + file, encoding="utf-8") as f:
                metadata = js.load(f)
            f.close()
            list_scripts.append(
                {
                    "link": metadata["watch_url"].split("=")[1],
                    "path": metadata["thumbnail_url"],
                    "video": file[:-5],
                    "frame": "Không xác đinh",
                    "s": times,
                }
            )

    return list_scripts


def check_script(file_content, keywords):
    for keyword in keywords:
        if keyword not in file_content:
            return False
    return True


def remove_stopwords(doc, stopwords):
    words = doc.split()

    # Lọc bỏ các stopwords
    filtered_words = [word for word in words if word not in stopwords]

    # Kết hợp các từ lại thành một đoạn văn
    filtered_doc = " ".join(filtered_words)

    return filtered_doc


def separate_paragraphs(script, max_word=128):
    # Tách đoạn văn thành danh sách các từ
    words = re.findall(r"\b\w+\b", script)

    # Tính số lượng từ trong mỗi đoạn văn con
    n_child_script = len(words) // max_word

    # Tạo danh sách các đoạn văn con
    child_scripts = []
    for i in range(n_child_script):
        start = i * max_word
        end = (i + 1) * max_word
        if i == n_child_script - 1:
            # Trường hợp cuối cùng, lấy tất cả từ còn lại
            child_script = " ".join(words[start:])
        else:
            child_script = " ".join(words[start:end])
        child_scripts.append(child_script)

    return child_scripts


def get_all_scripts():
    # Get list stopword
    with open("./stopwords.txt", "r", encoding="utf-8") as file:
        stopwords = file.read().splitlines()

    path = "../data/scripts"
    list_script = os.listdir(path)
    all_scripts = []
    list_file = []
    for script in list_script:
        if not ".txt" in script:
            continue
        list_file.append(script)
        script_path = os.path.join(path, script)
        with open(script_path, "r", encoding="utf-8") as file:
            content = file.read()
            all_scripts.append(remove_stopwords(content, stopwords))

    return list_file, all_scripts


def format_keyframes():
    video_names = [name for name in os.listdir(KEYFRAME_PATH) if name != ".gitkeep"]
    for name in video_names:
        keyframes = [path for path in os.listdir(os.path.join(KEYFRAME_PATH, name))]
    for kf in keyframes:
        img_name = kf.split(".")[0]
        if len(img_name) != LEN_OF_KEYFRAME_NAME:
            changed_path = os.path.join(KEYFRAME_PATH, name, img_name.zfill(4) + ".jpg")
            old_path = os.path.join(KEYFRAME_PATH, name, kf)
            print(f"Change {old_path} to {changed_path}")
            os.rename(old_path, changed_path)


def clean_dbs():
    DBs = [
        os.path.abspath(os.path.join(WORKSPACE, path)) for path in os.listdir(WORKSPACE)
    ]

    for db in DBs:
        shutil.rmtree(db)


def get_all_feats(feat=FEATURE_LARGE_PATH):
    if feat == FEATURE_PATH:
        print("Get features...")
    elif feat == FEATURE_LARGE_PATH:
        print("Get large feature")
    return [
        os.path.join(feat, file)
        for file in os.listdir(feat)
        if file.endswith(".npy")
    ]


def reformat_keyframe():
    video_names = [name for name in os.listdir(KEYFRAME_PATH) if name != ".gitkeep"]
    for name in video_names:
        keyframes = [path for path in os.listdir(os.path.join(KEYFRAME_PATH, name))]
        for kf in keyframes:
            img_name = kf.split(".")[0]
            if len(img_name) != LEN_OF_KEYFRAME_NAME:
                changed_path = os.path.join(
                    KEYFRAME_PATH, name, img_name.zfill(4) + ".jpg"
                )
                old_path = os.path.join(KEYFRAME_PATH, name, kf)
                print(f"Change {old_path} to {changed_path}")
                try:
                    os.rename(old_path, changed_path)
                except:
                    print("Error while rename file")
                    pass


def reformat_object():
    video_names = [name for name in os.listdir(OBJECT_PATH) if name != ".gitkeep"]
    for name in video_names:
        objs = [path for path in os.listdir(os.path.join(OBJECT_PATH, name))]
        for obj in objs:
            img_name = obj.split(".")[0]
            if len(img_name) != LEN_OF_KEYFRAME_NAME:
                changed_path = os.path.join(
                    OBJECT_PATH, name, img_name.zfill(4) + ".json"
                )
                old_path = os.path.join(OBJECT_PATH, name, obj)
                print(f"Change {old_path} to {changed_path}")
                os.rename(old_path, changed_path)


def create_html_script(images):
    styles = """
        <style>
            .image-list {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                grid-gap: 10px;
                max-height: 900px;
                overflow-y: scroll;
            }

            .image-item {
                position: relative;
            }

            .image-item img {
                max-width: 100%;
                height: auto;
                cursor: pointer;
            }

            .image-item a {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                text-align: center;
                justify-content: center;
                align-items: center;
                text-decoration: none;
                color: white;
            }

            .image-item:hover a {
                display: flex;
            }
        </style>
    """

    script_js = """
        <script>
            function openLink(url) {
                window.open(url, '_blank');
            }
        </script>
    """

    div_childs = ""

    for image in images:
        link = f"http://www.watchframebyframe.com/watch/yt/{image['link']}"
        div_child = f"""
            <div class="image-item">
                <img src="{image['path']}" alt="Ảnh 1">
                <figcaption>{image['video']} - {image['frame']} - {image['s']}</figcaption>            
                <a href={link} target="_blank">Xem chi tiết</a>
            </div>
        """
        div_childs += div_child

    html_script = f"""
        {styles}
       <div class="image-list">
            {div_childs}
        </div>
        {script_js}
    """

    return html_script


def load_all_objects():
    paths = [
        os.path.join(OBJECT_PATH, name)
        for name in os.listdir(OBJECT_PATH)
        if "gitkeep" not in name
    ]
    storage = {"label": [], "entity": []}
    for path in tqdm(paths):
        objects_paths = [os.path.join(path, name) for name in os.listdir(path)]
        for objects_path in tqdm(objects_paths):
            with open(file=objects_path, mode="r", encoding="utf-8") as f:
                datas = json.load(f)
                for i, label in enumerate(datas["detection_class_labels"]):
                    if label not in storage["label"]:
                        storage["label"].append(label)
                        storage["entity"].append(datas["detection_class_entities"][i])
                    elif (
                        datas["detection_class_entities"][i]
                        != storage["entity"][storage["label"].index(label)]
                    ):
                        print(datas["detection_class_entities"][i])
                        print(storage["entity"][storage["label"].index(label)])
                        print("Something wrong with labels id...")
                        return
    storage["entity"] = [entity.lower() for entity in storage["entity"]]
    pd.DataFrame(storage).to_csv("object_labels.csv", index=False)


def get_all_objects():
    objs = pd.read_csv("object_labels.csv", index_col=0).to_dict()
    # objs["entity"] = [item for item in objs["entity"]]

    return {
        "label": list(objs["entity"].keys()),
        "entity": list(objs["entity"].values()),
    }


def check_exist_object(objects: dict, given_obj: str) -> int:
    if given_obj in objects["entity"]:
        return objects["label"][objects["entity"].index(given_obj)]
    print(f"Object {given_obj} not exists")
    return -1


def check_exist_objects(objects: dict, given_objs: list):
    idxs = []
    for obj in given_objs:
        idx = check_exist_object(objects=objects, given_obj=obj)
        if idx == -1:
            return None
        idxs.append(idx)
    return set(idxs)


if __name__ == "__main__":
    pass
