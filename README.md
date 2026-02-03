# Violence Detection Web App

A modern web application for detecting violence in videos using AI/ML, built with FastAPI backend and React frontend.

## Features

- 📤 **Video Upload**: Drag-and-drop or browse to upload video files
- 🎬 **YouTube Analysis**: Analyze videos directly from YouTube URLs
- 🤖 **AI-Powered**: Uses TensorFlow/Keras model for violence detection
- 🎨 **Modern UI**: Beautiful purple/blue gradient design with Tailwind CSS
- 📊 **Detailed Results**: Shows violence score, confidence level, and verdict

## Tech Stack

### Backend
- FastAPI
- TensorFlow/Keras
- OpenCV
- yt-dlp
- Python 3.13+

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios

## Setup Instructions

### Prerequisites
- Python 3.13 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
```

2. Install dependencies:
```bash
pip install fastapi uvicorn python-multipart yt-dlp opencv-python tensorflow numpy python-dotenv
```

3. Make sure the model file `final_violence_model.keras` is in the root directory

4. Start the backend server:
```bash
cd backend
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Choose between uploading a video file or analyzing a YouTube URL
4. Click "Analyze" and wait for the results
5. View the violence detection score, verdict, and confidence level

## API Endpoints

### POST /api/analyze/upload
Upload and analyze a video file.

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "score": 75.5,
  "verdict": "Violence Detected",
  "confidence": 85.2,
  "frames_analyzed": 30
}
```

### POST /api/analyze/youtube
Analyze a YouTube video by URL.

**Request**:
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response**: Same as upload endpoint

## Project Structure

```
prism/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoUpload.jsx
│   │   │   ├── YouTubeInput.jsx
│   │   │   └── Results.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── final_violence_model.keras  # Trained model
└── venv/                       # Virtual environment
```

## Notes

- The backend analyzes the first 30 frames of each video for efficiency
- YouTube videos are downloaded at the lowest quality for faster processing
- Temporary files are automatically cleaned up after analysis
- CORS is configured for localhost:5173 by default

## Troubleshooting

**Backend issues:**
- Ensure the virtual environment is activated
- Check that all dependencies are installed
- Verify the model file exists at the correct path

**Frontend issues:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**YouTube download issues:**
- Some videos may be restricted or unavailable
- Make sure yt-dlp is up to date: `pip install -U yt-dlp`

## License

MIT
