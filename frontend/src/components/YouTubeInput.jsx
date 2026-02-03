import { useState } from 'react'
import axios from 'axios'

const YouTubeInput = ({ setResults, isAnalyzing, setIsAnalyzing }) => {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]+/
    ]
    
    return patterns.some(pattern => pattern.test(url))
  }

  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    
    if (newUrl && !validateYouTubeUrl(newUrl)) {
      setUrlError('Please enter a valid YouTube URL')
    } else {
      setUrlError('')
    }
  }

  const handleAnalyze = async () => {
    if (!url) {
      setUrlError('Please enter a YouTube URL')
      return
    }

    if (!validateYouTubeUrl(url)) {
      setUrlError('Invalid YouTube URL format')
      return
    }

    setIsAnalyzing(true)
    setResults(null)

    try {
      const response = await axios.post(
        'http://localhost:8000/api/analyze/youtube',
        { url }
      )

      setResults(response.data)
      setUrlError('')
    } catch (error) {
      console.error('Error analyzing YouTube video:', error)
      const errorMessage = error.response?.data?.detail || 
        'Failed to analyze YouTube video. The video may be unavailable or restricted.'
      setUrlError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* YouTube URL Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          YouTube Video URL
        </label>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://www.youtube.com/watch?v=..."
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
            urlError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-200'
          }`}
        />
        {urlError && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {urlError}
          </p>
        )}
      </div>

      {/* Example URLs */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">
          💡 Supported URL formats:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
          <li>• https://www.youtube.com/shorts/VIDEO_ID</li>
          <li>• https://youtu.be/VIDEO_ID</li>
        </ul>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!url || urlError || isAnalyzing}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
          !url || urlError || isAnalyzing
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
            Downloading & Analyzing...
          </span>
        ) : (
          '🔍 Analyze YouTube Video'
        )}
      </button>

      {isAnalyzing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            ⏳ This may take a few moments while we download and analyze the video...
          </p>
        </div>
      )}
    </div>
  )
}

export default YouTubeInput
