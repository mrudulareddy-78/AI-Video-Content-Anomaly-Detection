from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import cv2
import numpy as np
import os
import tempfile
import shutil
from pathlib import Path

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow import keras

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the violence detection model
MODEL_PATH = Path(__file__).parent.parent / "best_model.keras"

# Model constants from training
IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64
SEQUENCE_LENGTH = 16

def build_model_architecture():
    """Rebuild the model architecture manually"""
    from tensorflow.keras.layers import (
        Input, TimeDistributed, Bidirectional, LSTM,
        Dropout, Dense, Flatten
    )
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
    
    # Load MobileNetV2 as feature extractor
    mobilenet = MobileNetV2(
        include_top=False,
        weights='imagenet',
        input_shape=(IMAGE_HEIGHT, IMAGE_WIDTH, 3)
    )
    
    # Freeze MobileNet layers
    for layer in mobilenet.layers:
        layer.trainable = False
    
    # Build the same architecture as in training
    model = Sequential([
        Input(shape=(SEQUENCE_LENGTH, IMAGE_HEIGHT, IMAGE_WIDTH, 3)),
        TimeDistributed(mobilenet),
        TimeDistributed(Flatten()),
        Bidirectional(LSTM(32)),
        Dropout(0.5),
        Dense(64, activation="relu"),
        Dropout(0.5),
        Dense(2, activation="softmax")
    ])
    
    return model

def load_model_safe():
    """Try to load the model with different approaches"""
    global model
    
    # Try model files - prioritize final_violence_model.keras
    for model_name in ["final_violence_model.keras", "best_model.keras"]:
        model_path = Path(__file__).parent.parent / model_name
        
        if not model_path.exists():
            print(f"Model file {model_name} not found, trying next...")
            continue
            
        try:
            print(f"Attempting to load {model_name}...")
            
            # Method 1: Direct load
            try:
                model = keras.models.load_model(
                    str(model_path),
                    compile=False,
                    safe_mode=False
                )
                print(f"✓ Model loaded directly from {model_name}")
                model.compile(
                    optimizer='adam',
                    loss='categorical_crossentropy',
                    metrics=['accuracy']
                )
                return True
            except Exception as e1:
                print(f"  Direct load failed: {str(e1)[:100]}")
                
                # Method 2: Rebuild architecture and load weights
                try:
                    print(f"  Trying to rebuild architecture and load weights...")
                    model = build_model_architecture()
                    model.load_weights(str(model_path))
                    print(f"✓ Model architecture rebuilt and weights loaded from {model_name}")
                    model.compile(
                        optimizer='adam',
                        loss='categorical_crossentropy',
                        metrics=['accuracy']
                    )
                    return True
                except Exception as e2:
                    print(f"  Weight loading failed: {str(e2)[:100]}")
                    raise
            
        except Exception as e:
            error_msg = str(e)
            print(f"✗ Error loading {model_name}:")
            print(f"  {error_msg[:200]}")
            continue
    
    print("✗ Could not load any model. The app will run but analysis will fail.")
    print("  Make sure either 'best_model.keras' or 'final_violence_model.keras' exists")
    print("  You may need to re-export the model from your training notebook.")
    return False

# Try to load the model at startup
model = None
load_model_safe()


class YouTubeURL(BaseModel):
    url: str


def get_confidence_level(confidence: float) -> str:
    """
    Categorize confidence into HIGH, MEDIUM, or LOW.
    confidence is a float from 0 to 100.
    """
    if confidence >= 70:
        return "HIGH"
    elif confidence >= 40:
        return "MEDIUM"
    return "LOW"


def get_recommended_action(violence_score: float, confidence: float) -> tuple:
    """
    Determine recommended action and reasoning based on violence score and confidence.
    Returns (action, reasoning) tuple.
    """
    # High confidence - trust the model
    if confidence >= 70:
        if violence_score > 0.46:
            return ("BLOCK", "High confidence violence detected. Content violates safety policy.")
        else:
            return ("APPROVE", "Clear safe content with high confidence. No concerning activity detected.")
    
    # Medium confidence - be cautious
    elif confidence >= 40:
        if violence_score > 0.60:
            return ("REVIEW", "Moderate violence score with medium confidence. Manual review recommended.")
        elif violence_score > 0.35:
            return ("REVIEW", "Borderline content with medium confidence. Context assessment needed.")
        else:
            return ("APPROVE", "Likely safe content. Low violence indicators detected.")
    
    # Low confidence - review borderline cases
    else:
        if violence_score > 0.55:
            return ("REVIEW", "Borderline score with low confidence suggests sports/action content requiring human review.")
        elif violence_score > 0.40:
            return ("REVIEW", "Uncertain classification. Model recommends human judgment.")
        else:
            return ("APPROVE", "Low violence score despite uncertainty. Likely safe content.")


def check_violence(video_path: str) -> dict:
    """
    Analyze a video file for violence detection.
    Returns a dictionary with score, verdict, and confidence.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Unable to open video file")
        
        # Model expects sequences of 16 frames of 64x64 images
        SEQUENCE_LENGTH = 16
        IMAGE_SIZE = (64, 64)
        
        frames = []
        frame_count = 0
        
        # Read frames uniformly across the video
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames < SEQUENCE_LENGTH:
            # If video is too short, sample what we can
            frame_interval = 1
        else:
            frame_interval = max(1, total_frames // SEQUENCE_LENGTH)
        
        while cap.isOpened() and len(frames) < SEQUENCE_LENGTH:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_interval == 0:
                # Resize and normalize frame
                frame_resized = cv2.resize(frame, IMAGE_SIZE)
                frame_normalized = frame_resized / 255.0
                frames.append(frame_normalized)
            
            frame_count += 1
        
        cap.release()
        
        if len(frames) == 0:
            raise HTTPException(status_code=400, detail="No frames extracted from video")
        
        # Pad with zeros if we don't have enough frames
        while len(frames) < SEQUENCE_LENGTH:
            frames.append(np.zeros((IMAGE_SIZE[0], IMAGE_SIZE[1], 3)))
        
        # Prepare input for model: shape (1, SEQUENCE_LENGTH, 64, 64, 3)
        frames_array = np.array([frames[:SEQUENCE_LENGTH]])
        
        # Get prediction
        prediction = model.predict(frames_array, verbose=0)
        
        # Extract violence score (assuming binary classification)
        if prediction.shape[-1] == 2:
            # If output is 2D (NonViolence, Violence)
            violence_score = float(prediction[0][1])
        else:
            # If output is single value
            violence_score = float(prediction[0][0])
        
        confidence = abs(violence_score - 0.5) * 2  # Confidence from 0 to 1
        confidence_percent = round(confidence * 100, 2)
        
        # Get confidence level
        confidence_level = get_confidence_level(confidence_percent)
        
        # Get recommended action and reasoning
        recommended_action, reasoning = get_recommended_action(violence_score, confidence_percent)
        
        # Determine verdict (legacy field for backward compatibility)
        verdict = "Violence Detected" if violence_score > 0.5 else "No Violence Detected"
        
        return {
            "score": round(violence_score * 100, 2),
            "verdict": verdict,
            "confidence": confidence_percent,
            "confidence_level": confidence_level,
            "recommended_action": recommended_action,
            "reasoning": reasoning,
            "frames_analyzed": min(len(frames), SEQUENCE_LENGTH)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing video: {str(e)}")


def download_youtube_video(url: str) -> str:
    """
    Download a YouTube video and return the path to the downloaded file.
    """
    temp_dir = tempfile.mkdtemp()
    output_path = os.path.join(temp_dir, "video.mp4")
    
    ydl_opts = {
        'format': 'worst[ext=mp4]',  # Download lowest quality for faster processing
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
        'socket_timeout': 60,  # Increase timeout to 60 seconds
        'retries': 5,  # Retry up to 5 times
        'fragment_retries': 5,
        'ignoreerrors': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if info is None:
                raise ValueError("Unable to extract video information")
            
            # Check if video is available
            if info.get('is_live', False):
                raise ValueError("Live videos are not supported")
            
            # Download the video
            ydl.download([url])
            
            if not os.path.exists(output_path):
                raise ValueError("Video download failed")
            
            return output_path
    
    except Exception as e:
        # Clean up temp directory on error
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        error_msg = str(e)
        # Clean up ANSI color codes from error message
        error_msg = error_msg.replace('[0;31m', '').replace('[0m', '').replace('ERROR:', '').strip()
        raise ValueError(f"Failed to download video: {error_msg}")


@app.get("/")
def read_root():
    return {"message": "Violence Detection API", "status": "active"}


@app.post("/api/analyze/upload")
async def analyze_upload(file: UploadFile = File(...)):
    """
    Analyze an uploaded video file for violence detection.
    """
    # Validate file type
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Save uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze the video
        result = check_violence(temp_path)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
    finally:
        # Clean up
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


@app.post("/api/analyze/youtube")
async def analyze_youtube(data: YouTubeURL):
    """
    Analyze a YouTube video for violence detection.
    """
    url = data.url.strip()
    
    # Basic URL validation
    valid_prefixes = (
        "https://www.youtube.com/watch",
        "https://www.youtube.com/shorts",
        "https://youtu.be/",
        "http://www.youtube.com/watch",
        "http://www.youtube.com/shorts",
        "http://youtu.be/"
    )
    if not url.startswith(valid_prefixes):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    video_path = None
    temp_dir = None
    
    try:
        # Download the video
        video_path = download_youtube_video(url)
        temp_dir = os.path.dirname(video_path)
        
        # Analyze the video
        result = check_violence(video_path)
        
        return result
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing YouTube video: {str(e)}")
    finally:
        # Clean up
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
