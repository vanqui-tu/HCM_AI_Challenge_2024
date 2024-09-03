import wave, math, contextlib
import speech_recognition as sr
from moviepy.editor import AudioFileClip
from tqdm import tqdm
import os

NO_SCRIPT_PATH = "./../data/scripts/no_scripts.txt"

GET_AUDIO_FILE = False

# Doc danh sach
with open(NO_SCRIPT_PATH, 'r', encoding="utf-8") as file:
    lines = file.readlines()

for line in tqdm(lines):
    # Xuat file audio
    transcribed_audio_file_name = f"./../data/scripts/{line.strip()}.wav"
    compressed_trans_audio_file_name = f"./../data/scripts/{line.strip()}.mp3"
    zoom_video_file_name = f"./../data/videos/{line.strip()}.mp4"  
    if not os.path.isfile(transcribed_audio_file_name):
        audioclip = AudioFileClip(zoom_video_file_name)
        audioclip.write_audiofile(transcribed_audio_file_name)

    if GET_AUDIO_FILE:
        continue

    # Tinh thoi gian
    with contextlib.closing(wave.open(transcribed_audio_file_name,'r')) as f:
        frames = f.getnframes()
        rate = f.getframerate()
        duration = frames / float(rate)
    steps = math.ceil(duration / 60)

    # Xuat file transcript
    r = sr.Recognizer()
    with open(f"./../data/scripts/{line.strip()}.txt" , mode="a", encoding="utf-8", errors='ignore') as f:
        for i in range(steps):
            with sr.AudioFile(transcribed_audio_file_name) as source:
                offset = i*60
                audio = r.record(source, offset=offset, duration=min(60, duration-offset))
                try:
                    f.write(r.recognize_google(audio, language='vi').lower() + " ")
                except:
                    pass
        f.close()
    os.remove(transcribed_audio_file_name)
