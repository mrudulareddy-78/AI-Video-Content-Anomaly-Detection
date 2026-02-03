import { useState, useRef } from 'react'
import axios from 'axios'

const VideoUpload = ({ setResults, isAnalyzing, setIsAnalyzing }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      setResults(null)
    } else {
      alert('Please select a valid video file')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please select a video file first')
      return
    }

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post(
        'http://localhost:8000/api/analyze/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setResults(response.data)
    } catch (error) {
      console.error('Error analyzing video:', error)
      alert(
        error.response?.data?.detail || 
        'Failed to analyze video. Please try again.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-4 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        <div className="text-6xl mb-4">🎥</div>
        
        {selectedFile ? (
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Selected: {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
              }}
              className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Drag & drop your video here
            </p>
            <p className="text-sm text-gray-500">
              or click to browse files
            </p>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!selectedFile || isAnalyzing}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
          !selectedFile || isAnalyzing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Video...
          </span>
        ) : (
          '🔍 Analyze Video'
        )}
      </button>
    </div>
  )
}

export default VideoUpload
