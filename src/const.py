import torch
MODEL = "ViT-B/32"
# MODEL = "ViT-L/14@336px"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

METADATA_PATH = "../data/metadata/"
KEYFRAME_PATH = "../data/keyframes/"
FEATURE_PATH = "../data/features/"
FEATURE_LARGE_PATH = "../data/features-large/"
MAP_KEYFRAMES = "../data/map-keyframes/"
VIDEOS_PATH = "../data/videos/"
SCRIPT_PATH = "../data/scripts/"
OBJECT_PATH = "../data/objects/"

WORKSPACE = "./vectordb"
ROOT_DB = "root"
TEMP_DB = "temp"
LEN_OF_KEYFRAME_NAME = 4

# URL: https://eventretrieval.one/api/v1/submit  
# Method: GET
# Params: 
# {
#     "item": <VIDEO_ID>,
#     "frame": <FRAME_ID>,
#     "session": <SESSION_ID>
# }
# Response:
# {
#     "description": <DESCRIPTION>,
#     "status": <SUBMISSION_STATUS>
# }

SESSIONID = "node0196198hbqnuxk10j7x3q92kxz8406"
SUBMIT_URL = lambda item, frame: f"https://eventretrieval.one/api/v1/submit?session={SESSIONID}&item={item}&frame={frame}"