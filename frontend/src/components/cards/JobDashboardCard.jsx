// import React from 'react'
// import { Briefcase } from 'lucide-react'
// import moment from 'moment'

// const JobDashboardCard = ({ job }) => {
//   return (
//     <div className='flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors'>
//         <div className='flex items-center space-x-4'>
//             <div className='h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center'>
//                 <Briefcase className='h-5 w-5 text-blue-600'/>
//             </div>
//             <div>
//                 <h4 className='text-[15px] font-medium text-gray-900'>{job.title}</h4>
//                 <p className='text-xs text-gray-500'>
//                     {job.location} · {moment(job.createdAt)?.format("Do MM YYYY")}
//                 </p>
//             </div>
//         </div>
//         <div className='flex items-center space-x-3'>
//             <span className={`px-3 py-1 text-sx font-medium rounded-full ${!job.isClosed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
//                 {job.isClosed ? "Closed" : "Active"}
//             </span>
//         </div>
//     </div>
//   )
// }

// export default JobDashboardCard

import React from "react";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import moment from "moment";

const JobDashboardCard = ({ job }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200 group">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          <Briefcase className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
            {job.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-2.5 h-2.5" />
              {job.location}
            </span>
            <span className="text-slate-200">·</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-2.5 h-2.5" />
              {moment(job.createdAt).format("Do MMM YYYY")}
            </span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <span
        className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ml-3 ${
          !job.isClosed
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-slate-100 text-slate-500 border-slate-200"
        }`}
      >
        {job.isClosed ? "Closed" : "Active"}
      </span>
    </div>
  );
};

export default JobDashboardCard;
