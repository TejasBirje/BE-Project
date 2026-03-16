// import React from 'react'
// import { useAuth } from '../../../context/AuthContext'
// import amazonLogo from "../../../assets/Amazon logo.png"
// import { Bookmark, Building, Building2, Calendar, MapPin } from 'lucide-react';
// import moment from "moment"
// import StatusBadge from '../../../components/StatusBadge';

// const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply }) => {

//     const { user } = useAuth();

//     const formatSalary = (min, max) => {
//         const formatNumber = (num) => {
//             if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`
//             return `₹${num}`
//         }

//         return `${formatNumber(min)}/m`
//     }
//     return (
//         <div className='bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 group relative overflow-hidden cursor-pointer' onClick={onClick}>
//             <div className='flex items-start justify-between mb-4'>
//                 <div className='flex items-start gap-4'>
//                     {job?.company?.companyLogo ? (
//                         <img
//                             src={job?.company?.companyLogo || amazonLogo}
//                             alt="Logo"
//                             className='w-14 h-14 object-cover rounded-2xl border-4 border-white/20 shadow-lg'
//                         />
//                     ) : (
//                         <div className='w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center'>
//                             <Building2 className='h-8 w-8 text-gray-400' />
//                         </div>
//                     )}

//                     <div className='flex-1'>
//                         <h3 className='font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors leading-snug'>
//                             {job?.title}
//                         </h3>
//                         <p className='text-gray-600 text-sm flex items-center gap-2 mt-1'>
//                             <Building className='w-3.5 h-3.5' />
//                             {job?.company?.companyName}
//                         </p>
//                     </div>
//                 </div>
//                 {user && (
//                     <button
//                         className='p-2 hover:bg-gray-100 rounded-xl transition-colors'
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             onToggleSave();
//                         }}
//                     >
//                         <Bookmark className={`w-5 h-5 hover:text-blue-600 ${job?.isSaved || saved ? "text-blue-600" : "text-gray-400"}`} />
//                     </button>
//                 )}
//             </div>

//             <div className='mb-5'>
//                 <div className='flex items-center gap-2 text-xs'>
//                     <span className='flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium'>
//                         <MapPin className='w-3 h-3' />
//                         {job?.location}
//                     </span>
//                     <span className={`px-3 py-1 rounded-full font-medium ${job?.type === "Full-Time"
//                         ? "bg-green-100 text-green-800"
//                         : job.type === "Part-Time"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : job.type === "Contract"
//                                 ? "bg-purple-100 text-purple-800"
//                                 : "bg-blue-100 text-blue-800"
//                         }`}>
//                         {job?.type}
//                     </span>
//                     <span className='flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium'>
//                         {job?.category}
//                     </span>
//                 </div>
//             </div>

//             <div className='flex items-center justify-between text-xs font-medium text-gray-500 mb-5 pb-4 border-b border-gray-100'>
//                 <div className='flex items-center gap-4'>
//                     <span className='flex items-center gap-1.5'>
//                         <Calendar className='w-3.5 h-3.5' />
//                         {job?.createdAt ? moment(job.createdAt).format("Do MM YYYY") : "N/A"}
//                     </span>
//                 </div>
//             </div>

//             <div className="flex items-center justify-between">
//                 <div className="text-blue-600 font-semibold text-lg">
//                     {formatSalary(job?.salaryMin, job?.salaryMax)}
//                 </div>
//                 {!saved && (
//                     <>
//                         {job?.applicationStatus ? (
//                             <StatusBadge status={job?.applicationStatus} />
//                         ) : (
//                             !hideApply && (
//                                 <button
//                                     className="bg-linear-to-r from-blue-50 to-blue-50 text-sm text-blue-700 hover:text-white px-6 py-2.5 rounded-xl hover:from-blue-500 hover:to-blue-600 transition-colors duration-200 font-semibold transform hover:-translate-y-0.5"
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         onApply();
//                                     }}
//                                 >
//                                     Apply Now
//                                 </button>
//                             )
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default JobCard

// import React from 'react'
// import { useAuth } from '../../../context/AuthContext'
// import amazonLogo from "../../../assets/Amazon logo.png"
// import { Bookmark, Building, Building2, Calendar, MapPin, Clock } from 'lucide-react';
// import moment from "moment"
// import StatusBadge from '../../../components/StatusBadge';

// const typeStyles = {
//   "Full-Time":  "bg-emerald-50 text-emerald-700 border border-emerald-100",
//   "Part-Time":  "bg-amber-50 text-amber-700 border border-amber-100",
//   "Contract":   "bg-violet-50 text-violet-700 border border-violet-100",
//   "Internship": "bg-sky-50 text-sky-700 border border-sky-100",
// };

// const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply }) => {
//   const { user } = useAuth();

//   const formatSalary = (min, max) => {
//     const fmt = (num) => num >= 1000 ? `₹${(num / 1000).toFixed(0)}k` : `₹${num}`;
//     return `${fmt(min)}/m`;
//   };

//   const typeClass = typeStyles[job?.type] || "bg-blue-50 text-blue-700 border border-blue-100";

//   return (
//     <div
//       className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/70 hover:border-slate-200 transition-all duration-250 cursor-pointer overflow-hidden"
//       onClick={onClick}
//     >
//       {/* Subtle top accent on hover */}
//       <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-t-2xl" />

//       {/* Header row */}
//       <div className="flex items-start justify-between gap-3 mb-4">
//         <div className="flex items-start gap-3 min-w-0">
//           {/* Logo */}
//           {job?.company?.companyLogo ? (
//             <img
//               src={job?.company?.companyLogo || amazonLogo}
//               alt="Logo"
//               className="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-sm flex-shrink-0"
//             />
//           ) : (
//             <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
//               <Building2 className="h-5 w-5 text-slate-400" />
//             </div>
//           )}

//           {/* Title + Company */}
//           <div className="min-w-0 flex-1">
//             <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
//               {job?.title}
//             </h3>
//             <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
//               <Building className="w-3 h-3 flex-shrink-0" />
//               <span className="truncate">{job?.company?.companyName}</span>
//             </p>
//           </div>
//         </div>

//         {/* Bookmark */}
//         {user && (
//           <button
//             className={`p-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
//               job?.isSaved || saved
//                 ? "bg-blue-50 text-blue-600"
//                 : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
//             }`}
//             onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
//             title={job?.isSaved || saved ? "Remove from saved" : "Save job"}
//           >
//             <Bookmark className={`w-4 h-4 ${job?.isSaved || saved ? "fill-current" : ""}`} />
//           </button>
//         )}
//       </div>

//       {/* Tags row */}
//       <div className="flex flex-wrap items-center gap-1.5 mb-4">
//         <span className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
//           <MapPin className="w-3 h-3 text-slate-400" />
//           {job?.location}
//         </span>
//         <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeClass}`}>
//           {job?.type}
//         </span>
//         {job?.category && (
//           <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
//             {job?.category}
//           </span>
//         )}
//       </div>

//       {/* Date row */}
//       <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-100">
//         <Calendar className="w-3 h-3" />
//         <span>
//           {job?.createdAt ? moment(job.createdAt).format("Do MMM YYYY") : "N/A"}
//         </span>
//       </div>

//       {/* Footer: salary + action */}
//       <div className="flex items-center justify-between gap-2">
//         <div>
//           <span className="text-base font-bold text-slate-900">
//             {formatSalary(job?.salaryMin, job?.salaryMax)}
//           </span>
//         </div>

//         {!saved && (
//           <>
//             {job?.applicationStatus ? (
//               <StatusBadge status={job?.applicationStatus} />
//             ) : (
//               !hideApply && (
//                 <button
//                   className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 active:scale-95"
//                   onClick={(e) => { e.stopPropagation(); onApply(); }}
//                 >
//                   Apply Now
//                 </button>
//               )
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobCard;

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import amazonLogo from "../../../assets/Amazon logo.png";
import {
  Bookmark,
  Building,
  Building2,
  Calendar,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import moment from "moment";
import StatusBadge from "../../../components/StatusBadge";

const typeStyles = {
  "Full-Time": {
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  "Part-Time": {
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  Contract: {
    pill: "bg-violet-50 text-violet-700 border border-violet-100",
    dot: "bg-violet-500",
  },
  Internship: {
    pill: "bg-sky-50 text-sky-700 border border-sky-100",
    dot: "bg-sky-500",
  },
};

const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply }) => {
  const { user } = useAuth();
  const [applying, setApplying] = useState(false);

  const formatSalary = (min, max) => {
    const fmt = (num) =>
      num >= 1000 ? `₹${(num / 1000).toFixed(0)}k` : `₹${num}`;
    return `${fmt(min)}/m`;
  };

  const handleApply = async (e) => {
    e.stopPropagation();
    setApplying(true);
    try {
      await onApply();
    } finally {
      setApplying(false);
    }
  };

  const typeStyle = typeStyles[job?.type] || {
    pill: "bg-blue-50 text-blue-700 border border-blue-100",
    dot: "bg-blue-500",
  };

  /* Posted-time relative label */
  const postedLabel = job?.createdAt ? moment(job.createdAt).fromNow() : "N/A";

  const isNew =
    job?.createdAt && moment().diff(moment(job.createdAt), "days") <= 2;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer
                 transition-all duration-300
                 hover:shadow-xl hover:shadow-blue-900/[0.07] hover:border-blue-100 hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Top accent bar — animates in on hover */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500
                      scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-t-2xl"
      />

      <div className="p-5">
        {/* ── Row 1: Logo · Title · Bookmark ── */}
        <div className="flex items-start gap-3 mb-3.5">
          {/* Company logo / placeholder */}
          <div className="relative flex-shrink-0">
            {job?.company?.companyLogo ? (
              <img
                src={job?.company?.companyLogo || amazonLogo}
                alt="Logo"
                className="w-12 h-12 object-cover rounded-xl border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl flex items-center justify-center">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
            )}
            {/* "New" dot badge */}
            {isNew && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5">
              <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                {job?.title}
              </h3>
              {/* Arrow icon appears on hover */}
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              <Building className="w-3 h-3 flex-shrink-0" />
              <span className="truncate font-medium">
                {job?.company?.companyName}
              </span>
            </p>
          </div>

          {/* Bookmark */}
          {user && (
            <button
              className={`p-1.5 rounded-xl transition-all duration-200 flex-shrink-0 group/bm ${
                job?.isSaved || saved
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-300 hover:text-blue-500 hover:bg-blue-50"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              title={job?.isSaved || saved ? "Remove from saved" : "Save job"}
            >
              <Bookmark
                className={`w-4 h-4 transition-transform group-hover/bm:scale-110 ${
                  job?.isSaved || saved ? "fill-current" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* ── Row 2: Location · Type · Category ── */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
            <MapPin className="w-2.5 h-2.5 text-slate-400" />
            {job?.location}
          </span>

          <span
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeStyle.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${typeStyle.dot}`} />
            {job?.type}
          </span>

          {job?.category && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
              {job?.category}
            </span>
          )}

          {isNew && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              New
            </span>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-100 mb-3.5" />

        {/* ── Row 3: Posted ── */}
        <div className="flex items-center mb-4">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            {postedLabel}
          </span>
        </div>

        {/* ── Row 4: Salary + Apply ── */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">
              Salary
            </p>
            <span className="text-base font-bold text-slate-900">
              {formatSalary(job?.salaryMin, job?.salaryMax)}
            </span>
          </div>

          {!saved && (
            <>
              {job?.applicationStatus ? (
                <StatusBadge status={job?.applicationStatus} />
              ) : (
                !hideApply && (
                  <button
                    disabled={applying}
                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl
                                transition-all duration-200 active:scale-95 shadow-sm
                                ${
                                  applying
                                    ? "bg-blue-400 text-white cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-200"
                                }`}
                    onClick={handleApply}
                  >
                    {applying ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Applying…
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
