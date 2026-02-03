import { useState } from 'react'

const InfoPanel = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-300"
      >
        <span className="text-lg font-semibold text-blue-900">
          ℹ️ How does the analysis work?
        </span>
        <span className="text-xl text-blue-600">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 p-6 bg-white border border-blue-200 rounded-lg animate-slideDown">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-6">
                🎯 Confidence-Aware Decision Logic:
              </h3>
            </div>

            {/* HIGH CONFIDENCE */}
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🟢</span>
                <span className="font-bold text-green-900 text-lg">High Confidence (≥70%)</span>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700">
                <div>• Violence score &gt;46% → <span className="font-semibold">BLOCK 🚫</span></div>
                <div>• Violence score ≤46% → <span className="font-semibold">APPROVE ✅</span></div>
              </div>
            </div>

            {/* MEDIUM CONFIDENCE */}
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🟡</span>
                <span className="font-bold text-yellow-900 text-lg">Medium Confidence (40-70%)</span>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700">
                <div>• Violence score &gt;60% → <span className="font-semibold">REVIEW ⚠️</span></div>
                <div>• Violence score 35-60% → <span className="font-semibold">REVIEW ⚠️</span></div>
                <div>• Violence score &lt;35% → <span className="font-semibold">APPROVE ✅</span></div>
              </div>
            </div>

            {/* LOW CONFIDENCE */}
            <div>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🔴</span>
                <span className="font-bold text-red-900 text-lg">Low Confidence (&lt;40%)</span>
              </div>
              <div className="ml-10 space-y-2 text-sm text-gray-700">
                <div>• Violence score &gt;55% → <span className="font-semibold">REVIEW ⚠️</span></div>
                <div className="text-xs text-gray-600 ml-4">(likely sports/action content)</div>
                <div>• Violence score 40-55% → <span className="font-semibold">REVIEW ⚠️</span></div>
                <div className="text-xs text-gray-600 ml-4">(uncertain classification)</div>
                <div>• Violence score &lt;40% → <span className="font-semibold">APPROVE ✅</span></div>
              </div>
            </div>

            {/* KEY INSIGHT */}
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="font-bold text-blue-900 mb-2">💡 Key Insight:</div>
              <p className="text-sm text-gray-700">
                Lower confidence requires more caution. The system flags borderline cases for 
                human review when the model is unsure.
              </p>
            </div>

            {/* EXAMPLE SCENARIOS */}
            <div>
              <div className="font-bold text-blue-900 mb-4">📊 Example Scenarios:</div>
              
              <div className="space-y-3">
                {/* Street fight */}
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm"><span className="font-semibold">Street fight:</span> 98% score, HIGH conf</div>
                  <div className="text-sm text-red-900 font-semibold ml-4">→ BLOCK 🚫 (clear violence)</div>
                </div>

                {/* Hockey fight */}
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="text-sm"><span className="font-semibold">Hockey fight:</span> 61% score, LOW conf</div>
                  <div className="text-sm text-orange-900 font-semibold ml-4">→ REVIEW ⚠️ (sports vs violence?)</div>
                </div>

                {/* Interview */}
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="text-sm"><span className="font-semibold">Interview:</span> 1% score, HIGH conf</div>
                  <div className="text-sm text-green-900 font-semibold ml-4">→ APPROVE ✅ (clearly safe)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default InfoPanel
