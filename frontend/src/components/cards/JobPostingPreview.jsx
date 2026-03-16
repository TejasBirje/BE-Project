// import React from 'react'
// import { MapPin, DollarSign, ArrowLeft, Building2, Clock, Users } from "lucide-react";
// import { CATEGORIES, JOB_TYPES } from '../../utils/data';
// import { useAuth } from '../../context/AuthContext';

// const JobPostingPreview = ({ formData, setIsPreview }) => {
//     const { user } = useAuth();
//     const currencies = [{ value: "usd", label: "$" }, { value: "inr", label: "₹" }];

//     return (
//         <div className='min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30'>
//             <div className='max-4-xl mx-auto'>

//                 {/* Header with glass effect */}
//                 <div className='mb-8 backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl rounded-2xl px-6 pt-6'>
//                     <div className='flex items-center justify-between'>
//                         <div className='flex items-center space-x-4'>
//                             <h2 className='text-lg md:text-xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
//                                 Job Preview
//                             </h2>
//                         </div>
//                         <button
//                             onClick={() => setIsPreview(false)}
//                             className='group flex items-center space-x-2 px-6 py-3 text-xs md:text-sm font-medium text-gray-600 hover:text-white bg-white/50 hover:bg-linear-to-r hover:from-blue-500 hover:to-blur-600 border border-gray-200 hover:border-transparent rounded-xl transition-all duration-300 shadow-lg shadow-gray-100 hover:shadow-xl transform hover:translate-y-0.5'
//                         >
//                             <ArrowLeft className='h-4 w-4 transition-transform group-hover-translate-x-1' />
//                             <span>Back to Edit</span>
//                         </button>
//                     </div>
//                     {/* Main Content Card */}
//                     <div className=''>
//                         {/* Hero Section with clean bg */}
//                         <div className='relative bg-white px-0 pb-8 mt-8 border-b border-gray-100'>
//                             <div className='relative z-10'>
//                                 <div className='flex items-start justify-between mb-8'>
//                                     <div className='flex-l'>
//                                         <h1 className='text-lg lg:text-sl font-semibold mb-2 leading-tight text-gray-900'>
//                                             {formData.jobTitle}
//                                         </h1>
//                                         <div className='flex items-center space-x-4 text-gray-600'>
//                                             <div className='flex items-center space-x-2'>
//                                                 <MapPin className='h-4 w-4' />
//                                                 <span className='text-sm font-medium'>
//                                                     {formData.isRemote ? "Remote" : formData.location}
//                                                 </span>
//                                                 {formData.isRemote && formData.location && (
//                                                     <span className='text-sm text-gray-500'>
//                                                         {" "}
//                                                         * {formData.location}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {user?.companyLogo ? (
//                                         <img
//                                             src={user.companyLogo}
//                                             alt='Company Logo'
//                                             className='h-15 md:h-20 md:w-20 object-cover rounded-2xl border-4 border-white/20 shadow-lg'
//                                         />
//                                     ) : (
//                                         <div className='h-20 w-20 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center'>
//                                             <Building2 className={"h-8 w-8 text-gray-400"} />
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Tags */}
//                                 <div className='flex flex-wrap gap-3 mt-6 md:mt-8'>
//                                     <span className='px-4 py-2 bg-blue-50 text-sm text-blue-700 font-semibold rounded-full border border-blue-200'>
//                                         {CATEGORIES.find((c) => c.value === formData.category)?.label}
//                                     </span>
//                                     <span className='px-4 py-2 text-sm bg-purple-50 text-purple-700 font-semibold rounded-full border border-purple-200'>
//                                         {JOB_TYPES.find((j) => j.value === formData.jobType)?.label}
//                                     </span>
//                                     <div className='flex items-center space-x-1 px-4 py-2 bg-gray-60 text-sm text-gray-700 font-semibold rounded-full border border-gray-200'>
//                                         <Clock className='h-4 w-4' />
//                                         <span>Posted Today</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Content sections */}
//                         <div className="px-8 pb-8 space-y-8">
//                             {/* Salary Section */}
//                             <div className="relative overflow-hidden bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl">

//                                 {/* Decorative bubble */}
//                                 <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/10 to-teal-400/10 rounded-full -translate-y-16 translate-x-16" />

//                                 <div className="relative z-10">
//                                     <div className="flex items-center justify-between">

//                                         <div className="flex items-center space-x-3">
//                                             <div className="p-3 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl">
//                                                 <DollarSign className="h-5 w-5 text-white" />
//                                             </div>

//                                             <div>
//                                                 <h3 className="text-sm font-semibold text-gray-900 mb-1">
//                                                     Compensation
//                                                 </h3>

//                                                 <div className="text-sm md:text-lg font-bold text-gray-900">
//                                                     {currencies.find(c => c.value === formData.currency)?.label}
//                                                     {formData.salaryMin.toLocaleString()}{" "}
//                                                     -{" "}
//                                                     {currencies.find(c => c.value === formData.currency)?.label}
//                                                     {formData.salaryMax.toLocaleString()}

//                                                     <span className="text-sm md:text-base text-gray-600 font-normal ml-1">
//                                                         per year
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Badge */}
//                                         <div className="hidden md:flex items-center space-x-2 text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
//                                             <Users className="h-4 w-4" />
//                                             <span>Competitive</span>
//                                         </div>

//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Job Desc */}
//                         <div className='space-y-4'>
//                             <h3 className='text-2xl font-bold text-gray-900 flex items-center space-x-3'>
//                                 <div className='w-1 h-8 bg-linear-to-b from-blue-500 to-purple-600 rounded-full'>
//                                 </div>
//                                 <span className='text-base md:text-lg'>
//                                     About this Role
//                                 </span>
//                             </h3>
//                             <div className='bg-gray-50 border border-gray-100 rounded-xl p-6'>
//                                 <div className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
//                                     {formData.description}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Requirement */}
//                         <div className='space-y-4'>
//                             <h3 className='text-2xl font-bold text-gray-900 flex items-center space-x-3'>
//                                 <div className='w-1 h-8 bg-linear-to-b from-purple-500 to-pink-600 rounded-full'>
//                                 </div>
//                                     <span className='text-base md:text-lg'>What we're looking for</span>
//                             </h3>
//                             <div className='bg-linear-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6 mb-5'>
//                                 <div className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
//                                     {formData.requirements}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default JobPostingPreview

import React from "react";
import {
  MapPin,
  IndianRupee,
  ArrowLeft,
  Building2,
  Clock,
  Users,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import { useAuth } from "../../context/AuthContext";

const Tag = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${className}`}
  >
    {children}
  </span>
);

const SectionHeading = ({ accent, children }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-1 h-7 rounded-full ${accent}`} />
    <h2 className="text-sm font-bold text-slate-900">{children}</h2>
  </div>
);

const JobPostingPreview = ({ formData, setIsPreview }) => {
  const { user } = useAuth();

  const categoryLabel =
    CATEGORIES.find((c) => c.value === formData.category)?.label ||
    formData.category;
  const jobTypeLabel =
    JOB_TYPES.find((j) => j.value === formData.jobType)?.label ||
    formData.jobType;

  const typeStyles = {
    "Full-Time": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Part-Time": "bg-amber-50 text-amber-700 border-amber-100",
    Contract: "bg-violet-50 text-violet-700 border-violet-100",
    Internship: "bg-sky-50 text-sky-700 border-sky-100",
  };
  const typeClass =
    typeStyles[jobTypeLabel] || "bg-blue-50 text-blue-700 border-blue-100";

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Job Preview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            This is how your job posting will appear to candidates
          </p>
        </div>
        <button
          onClick={() => setIsPreview(false)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Edit
        </button>
      </div>

      {/* Preview badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold px-4 py-2.5 rounded-xl mb-5">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        Preview mode — this is a draft. Publish to make it live.
      </div>

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        <div className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        <div className="p-5 sm:p-7">
          {/* Company + Title */}
          <div className="flex items-start gap-4 mb-5">
            {user?.companyLogo ? (
              <img
                src={user.companyLogo}
                alt="Company Logo"
                className="w-14 h-14 object-cover rounded-2xl border border-slate-100 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-1">
                {formData.jobTitle || (
                  <span className="text-slate-300">Job title</span>
                )}
              </h2>
              {user?.name && (
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {user.name}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {formData.location && (
              <Tag className="bg-slate-50 text-slate-600 border-slate-100">
                <MapPin className="w-3 h-3" />
                {formData.location}
              </Tag>
            )}
            {jobTypeLabel && <Tag className={typeClass}>{jobTypeLabel}</Tag>}
            {categoryLabel && (
              <Tag className="bg-blue-50 text-blue-700 border-blue-100">
                {categoryLabel}
              </Tag>
            )}
            <Tag className="bg-slate-50 text-slate-500 border-slate-100">
              <Clock className="w-3 h-3" />
              Posted Today
            </Tag>
          </div>

          <div className="border-t border-slate-100" />
        </div>
      </div>

      {/* ── Compensation card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-100 flex-shrink-0">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Compensation
            </p>
            <div className="text-base font-bold text-slate-900">
              {formData.salaryMin && formData.salaryMax ? (
                <>
                  ₹{Number(formData.salaryMin).toLocaleString()} – ₹
                  {Number(formData.salaryMax).toLocaleString()}
                  <span className="text-sm text-slate-400 font-normal ml-1.5">
                    per year
                  </span>
                </>
              ) : (
                <span className="text-slate-300 font-normal text-sm">
                  Not specified
                </span>
              )}
            </div>
          </div>
          <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
            <Users className="h-3 w-3" />
            Competitive
          </span>
        </div>
      </div>

      {/* ── About this role ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 mb-4">
        <SectionHeading accent="bg-gradient-to-b from-blue-500 to-indigo-600">
          About This Role
        </SectionHeading>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[80px]">
          {formData.description || (
            <span className="text-slate-300">
              Job description will appear here…
            </span>
          )}
        </div>
      </div>

      {/* ── Requirements ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
        <SectionHeading accent="bg-gradient-to-b from-violet-500 to-pink-500">
          What We're Looking For
        </SectionHeading>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-violet-50/50 rounded-xl p-4 border border-violet-100 min-h-[80px]">
          {formData.requirements || (
            <span className="text-slate-300">
              Requirements will appear here…
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;
