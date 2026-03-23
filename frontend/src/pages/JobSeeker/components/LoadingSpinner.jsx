import React from 'react'
import { Briefcase } from 'lucide-react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-5">
      {/* Animated logo mark */}
      <div className="relative">
        <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 animate-pulse">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        {/* Spinning ring */}
        <div className="absolute -inset-2 rounded-[22px] border-2 border-transparent border-t-blue-400 animate-spin" />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Finding jobs for you</p>
        <p className="text-xs text-slate-400 mt-1">Hang tight...</p>
      </div>

      {/* Skeleton cards */}
      <div className="w-full max-w-2xl px-4 mt-2 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded-lg w-3/5" />
                <div className="h-3 bg-slate-100 rounded-lg w-2/5" />
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-slate-100 rounded-full w-24" />
              <div className="h-6 bg-slate-100 rounded-full w-16" />
              <div className="h-6 bg-slate-100 rounded-full w-20" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-100 rounded-lg w-20" />
              <div className="h-8 bg-slate-100 rounded-xl w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoadingSpinner