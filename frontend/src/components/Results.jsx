import { useEffect, useState } from 'react'

const Results = ({ results }) => {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Animate score on mount
    const targetScore = results.score
    const duration = 1000
    const steps = 60
    const increment = targetScore / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setAnimatedScore(targetScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(increment * currentStep)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [results])

  // Determine colors based on recommended_action
  const getActionColor = (action) => {
    switch (action) {
      case 'BLOCK':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-900',
          icon: '🚫'
        }
      case 'REVIEW':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-500',
          text: 'text-orange-900',
          icon: '⚠️'
        }
      case 'APPROVE':
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-900',
          icon: '✅'
        }
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-900',
          icon: '❓'
        }
    }
  }

  // Determine confidence badge color
  const getConfidenceBadgeColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'bg-green-200 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-200 text-yellow-800'
      case 'LOW':
        return 'bg-gray-200 text-gray-800'
      default:
        return 'bg-gray-200 text-gray-800'
    }
  }

  const actionColor = getActionColor(results.recommended_action)

  return (
    <div className="mt-8 animate-fadeIn">
      <div className={`border-2 ${actionColor.border} ${actionColor.bg} rounded-xl p-6`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎯 Analysis Results
        </h2>

        {/* Recommended Action - Large and Prominent */}
        <div className="mb-8 text-center">
          <div className="inline-block">
            <div className={`text-4xl font-bold ${actionColor.text} mb-2`}>
              {actionColor.icon} {results.recommended_action}
            </div>
            <p className={`text-sm ${actionColor.text} font-medium`}>
              {results.recommended_action === 'BLOCK' && 'Content violates safety policy'}
              {results.recommended_action === 'REVIEW' && 'Manual review recommended'}
              {results.recommended_action === 'APPROVE' && 'Content is safe'}
            </p>
          </div>
        </div>

        {/* Violence Score */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Violence Score
            </span>
            <span className={`text-xl font-bold ${
              results.score > 60 ? 'text-red-600' : 
              results.score > 35 ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {animatedScore.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
            <div
              className={`${
                results.score > 60 ? 'bg-red-500' :
                results.score > 35 ? 'bg-orange-500' :
                'bg-green-500'
              } h-full rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${animatedScore}%` }}
            />
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="mb-6 flex items-center justify-center">
          <div className={`px-4 py-2 rounded-full font-semibold ${getConfidenceBadgeColor(results.confidence_level)}`}>
            Confidence: {results.confidence}% {results.confidence_level}
          </div>
        </div>

        {/* Reasoning */}
        {results.reasoning && (
          <div className="mb-6 p-4 bg-white bg-opacity-70 rounded-lg border border-gray-300">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              📋 Reasoning:
            </h3>
            <p className="text-sm italic text-gray-700">
              "{results.reasoning}"
            </p>
          </div>
        )}

        {/* Frames Analyzed */}
        <div className="text-center text-sm text-gray-600">
          📊 Frames Analyzed: {results.frames_analyzed}
        </div>
      </div>
    </div>
  )
}

export default Results
