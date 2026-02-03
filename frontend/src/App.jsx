import { useState } from 'react'
import VideoUpload from './components/VideoUpload'
import YouTubeInput from './components/YouTubeInput'
import Results from './components/Results'
import InfoPanel from './components/InfoPanel'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [results, setResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Violence Detection AI
          </h1>
          <p className="text-purple-100 text-lg">
            Analyze videos for violent content using advanced AI
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              📤 Upload Video
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'youtube'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎬 YouTube URL
            </button>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {activeTab === 'upload' ? (
              <VideoUpload 
                setResults={setResults} 
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            ) : (
              <YouTubeInput 
                setResults={setResults}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            )}

            {/* Info Panel */}
            <InfoPanel />

            {/* Results Display */}
            {results && (
              <Results results={results} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-purple-100">
          <p className="text-sm">
            Powered by TensorFlow & FastAPI • Built with React & Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
