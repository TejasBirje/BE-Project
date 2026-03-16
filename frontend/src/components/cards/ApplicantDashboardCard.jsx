// import React from 'react'
// import { Clock } from 'lucide-react'

// const ApplicantDashboardCard = ({ applicant, position, time }) => {
//     return (
//         <div className='flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors'>

//             {/* Left side */}
//             <div className='flex items-center space-x-4'>
//                 <div className='h-10 w-10 bg-linear-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center'>
//                     <span className='text-white font-medium text-sm'>
//                         {applicant.name.split(" ").map(n => n[0]).join("")}
//                     </span>
//                 </div>

//                 <div>
//                     <h4 className='text-[15px] font-medium text-gray-900'>
//                         {applicant.name}
//                     </h4>
//                     <p className='text-sm text-gray-500'>
//                         {position}
//                     </p>
//                 </div>
//             </div>

//             {/* Right side */}
//             <div className='flex items-center text-sm text-gray-500'>
//                 <Clock className='h-4 w-4 mr-1' />
//                 {time}
//             </div>
//         </div>
//     )
// }

// export default ApplicantDashboardCard

import React from "react";
import { Clock } from "lucide-react";

/* Generate a consistent gradient per name for the avatar */
const avatarGradients = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
];

const getGradient = (name = "") => {
  const idx = name.charCodeAt(0) % avatarGradients.length;
  return avatarGradients[idx];
};

const ApplicantDashboardCard = ({ applicant, position, time }) => {
  const initials = applicant?.name
    ? applicant.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const gradient = getGradient(applicant?.name || "");

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200 group">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div
          className={`w-9 h-9 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
        >
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>

        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
            {applicant?.name}
          </h4>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {position}
          </p>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0 ml-3">
        <Clock className="h-3 w-3" />
        <span>{time}</span>
      </div>
    </div>
  );
};

export default ApplicantDashboardCard;
