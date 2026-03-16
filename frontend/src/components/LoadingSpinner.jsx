// import React from 'react'
// import { Briefcase } from 'lucide-react'

// const LoadingSpinner = () => {
//   return (
//     <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
//         <div className='text-center'>
//             <div className='relative'>
//                 <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-700 border-t-blue-100 mx-auto mb-4'>

//                 </div>
//                 <div className='absolute inset-0 flex items-center justify-center'>
//                     <Briefcase className='w-6 h-6 text-blue-600'/>
//                 </div>
//             </div>
//             <p className='text-gray-600 font-medium'>Finding opportunities...</p>
//         </div>
//     </div>
//   )
// }

// export default LoadingSpinner

import React from "react";
import { Briefcase } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      {/* Animated logo mark */}
      <div className="relative">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 animate-pulse">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        {/* Spinning ring */}
        <div className="absolute -inset-2 rounded-[22px] border-2 border-transparent border-t-blue-400 animate-spin" />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">
          Loading dashboard
        </p>
        <p className="text-xs text-slate-400 mt-1">Fetching your data…</p>
      </div>

      {/* Skeleton rows */}
      <div className="w-full max-w-lg space-y-3 px-4 mt-1">
        {[80, 60, 72].map((w, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse flex gap-3"
          >
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div
                className="h-3 bg-slate-100 rounded-lg"
                style={{ width: `${w}%` }}
              />
              <div className="h-3 bg-slate-100 rounded-lg w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;
