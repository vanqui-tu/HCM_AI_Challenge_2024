import torch 
import clip
import PIL
import numpy as np
from torch.utils.data import Dataset, DataLoader
from tqdm import tqdm
from const import *
import os

if torch.cuda.is_available():
    device = torch.device("cuda")
    data_type = torch.float16
else:
    device = torch.device("cpu")
    data_type = torch.float32

class KeyFrameDataset(Dataset):
    def __init__(self, vid, preprocess=None):
        self.preprocess = preprocess
        self.vid = vid
        self.keyframe_ids = []
        for fid in os.listdir(os.path.join(KEYFRAME_PATH, vid)):
            self.keyframe_ids.append(fid.replace('.jpg', ''))

    def __len__(self):
        return len(self.keyframe_ids)

    def __getitem__(self, index):
        fid = self.keyframe_ids[index]
        try:
            image_path = KEYFRAME_PATH + self.vid + f"/{fid}.jpg"
            img = PIL.Image.open(image_path).convert("RGB")
            if self.preprocess is not None:
                img = self.preprocess(img)
            return self.vid, fid, img
        except Exception as e:
            print(f"Exception: {e}")

def extract_feature(dataset, model):
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False)
    features = []
    with torch.no_grad():
        for video_id, keyframe_id, img in tqdm(dataloader):
            img = img.to(device)
            img_feature = model.encode_image(img)
            vector_list = img_feature.cpu().tolist()
            for vector in vector_list:
                features.append(vector)            
    with open(FEATURE_LARGE_PATH + dataset.vid + '.npy' , 'wb') as f:
        np.save(f, np.array(features))

if __name__=='__main__':
    if not os.path.exists(FEATURE_LARGE_PATH):
        os.makedirs(FEATURE_LARGE_PATH)
    clip_model, preprocess = clip.load('ViT-L/14@336px', device=device)
    clip_model.eval()

    # Only L01 videos
    kf_folders = [name for name in os.listdir(KEYFRAME_PATH) 
                  if os.path.isdir(os.path.join(KEYFRAME_PATH, name)) 
                  and name.startswith('L07')]
    
    for kf_folder in tqdm(kf_folders):  
        dataset = KeyFrameDataset(vid=kf_folder, preprocess=preprocess)
        extract_feature(dataset=dataset, model=clip_model)

