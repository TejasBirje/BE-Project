// import { motion } from "framer-motion"
// import { Search, ArrowRight, Users, Building2, TrendingUp } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import { useAuth } from "../../../context/AuthContext";

// const Hero = () => {
//     const { user, isAuthenticated } = useAuth();

//     const navigate = useNavigate();

//     const stats = [
//         {
//             icon: Users, label: "Active Users", value: "50,000+"
//         }, {
//             icon: Building2, label: "Companies", value: "200+"
//         }, {
//             icon: TrendingUp, label: "Jobs Posted", value: "25000+"
//         }
//     ]

//   return (
//     <section className="pt-24 pb-16 bg-white min-h-screen flex items-center">
//         <div className="container mx-auto px-4">
//             <div className="max-w-4xl mx-auto text-center">

//                 {/* Main Heading */}
//                 <motion.h1
//                     initial={{ opacity: 0, y: 30}}
//                     animate={{ opacity: 1, y: 0}}
//                     transition={{ duration: 0.8 }}
//                     className="text-xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight pt-10"
//                 >
//                     Find Your Dream Job or {" "}
//                     <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
//                         Perfect Hire
//                     </span>
//                 </motion.h1>

//                 {/* SubHeading */}
//                 <motion.p
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2, duration: 0.8}}
//                     className="text-xl md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
//                 >
//                     Connect Talented Professionals With Innovative Companies.
//                     Your Next Career Move or Perfect Candidate is Just One Click Away.
//                 </motion.p>

//                 {/* CTA Button */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.4, duration: 0.8 }}
//                     className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
//                 >
//                     <motion.button
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         className="group bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
//                         onClick={() => navigate("/find-jobs")}
//                     >
//                         <Search className="w-5 h-5"/>
//                         <span>
//                             Find Jobs
//                         </span>
//                         <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
//                     </motion.button>

//                     <motion.button
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
//                         onClick={() => {
//                             navigate(
//                                 isAuthenticated && user?.role === "employer"
//                                 ? "/employer-dashboard"
//                                 : "/login"
//                             )
//                         }}
//                     >
//                         Post a Job
//                     </motion.button>
//                 </motion.div>

//                 {/* Stats */}

//                 <motion.div
//                     initial={{ opacity: 0, y: 30}}
//                     animate={{ opacity: 1, y:0 }}
//                     transition={{ delay: 0.6, duration: 0.8 }}
//                     className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
//                 >
//                     {stats.map((stat, index) => (
//                         <motion.div
//                             key={index}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
//                             className="flex flex-col items-center space-y-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
//                         >
//                             <div className="w-12 h-12 bg-linear-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-2">
//                                 <stat.icon className="w-6 h-6 text-blue-600" />
//                             </div>
//                             <div className="text-2xl font-bold text-gray-900">
//                                 {stat.value}
//                             </div>
//                             <div className="text-sm text-gray-600 font-medium">
//                                 {stat.label}
//                             </div>
//                         </motion.div>
//                     ))}
//                 </motion.div>
//             </div>
//         </div>

//         {/* Subtle background elements */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//             <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
//             <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-blue-50 to-purple-50 rounded-full blur-3xl opacity-20"></div>
//         </div>
//     </section>
//   )
// }

// export default Hero

// import { motion } from "framer-motion"
// import { Search, ArrowRight, Users, Building2, TrendingUp, Sparkles } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import { useAuth } from "../../../context/AuthContext";

// const Hero = () => {
//     const { user, isAuthenticated } = useAuth();
//     const navigate = useNavigate();

//     const stats = [
//         { icon: Users, label: "Active Users", value: "50,000+" },
//         { icon: Building2, label: "Companies", value: "200+" },
//         { icon: TrendingUp, label: "Jobs Posted", value: "25,000+" }
//     ];

//     const trendingTags = ["Remote", "AI / ML", "Full Stack", "Product Manager", "Data Science", "UX Design"];

//     return (
//         <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 min-h-screen flex items-center overflow-hidden bg-white">

//             {/* Background mesh */}
//             <div className="absolute inset-0 pointer-events-none overflow-hidden">
//                 <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
//                 <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-indigo-100 rounded-full blur-3xl opacity-35" />
//                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-linear-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50" />
//                 {/* Subtle dot grid */}
//                 <div
//                     className="absolute inset-0 opacity-[0.025]"
//                     style={{
//                         backgroundImage: 'radial-gradient(circle, #1e40af 1px, transparent 1px)',
//                         backgroundSize: '28px 28px'
//                     }}
//                 />
//             </div>

//             <div className="container mx-auto px-4 sm:px-6 relative z-10 w-full">
//                 <div className="max-w-3xl mx-auto text-center">

//                     {/* Pill badge */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5 }}
//                         className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full mb-8"
//                     >
//                         <Sparkles className="w-3.5 h-3.5 text-blue-500" />
//                         AI-Powered Job Matching Platform
//                     </motion.div>

//                     {/* Heading */}
//                     <motion.h1
//                         initial={{ opacity: 0, y: 28 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.7, delay: 0.1 }}
//                         className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 leading-[1.12] tracking-tight"
//                     >
//                         Find Your Dream Job or{" "}
//                         <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                             Perfect Hire
//                         </span>
//                     </motion.h1>

//                     {/* Subheading */}
//                     <motion.p
//                         initial={{ opacity: 0, y: 28 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.2, duration: 0.7 }}
//                         className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed"
//                     >
//                         Connect talented professionals with innovative companies.
//                         Your next career move or perfect candidate is just one click away.
//                     </motion.p>

//                     {/* CTA Buttons */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 28 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.32, duration: 0.7 }}
//                         className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10"
//                     >
//                         <motion.button
//                             whileHover={{ scale: 1.025, boxShadow: '0 8px 32px rgba(37,99,235,0.28)' }}
//                             whileTap={{ scale: 0.97 }}
//                             className="group w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-700 text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-blue-200 flex items-center justify-center gap-2.5"
//                             onClick={() => navigate("/find-jobs")}
//                         >
//                             <Search className="w-4 h-4" />
//                             Find Jobs
//                             <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//                         </motion.button>

//                         <motion.button
//                             whileHover={{ scale: 1.025 }}
//                             whileTap={{ scale: 0.97 }}
//                             className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-7 py-3.5 rounded-xl font-semibold text-base hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all duration-300 shadow-sm"
//                             onClick={() => navigate(
//                                 isAuthenticated && user?.role === "employer"
//                                     ? "/employer-dashboard"
//                                     : "/login"
//                             )}
//                         >
//                             Post a Job
//                         </motion.button>
//                     </motion.div>

//                     {/* Trending Tags */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.42, duration: 0.6 }}
//                         className="flex flex-wrap justify-center gap-2 mb-16"
//                     >
//                         <span className="text-xs text-slate-400 font-medium self-center mr-1">Trending:</span>
//                         {trendingTags.map((tag) => (
//                             <button
//                                 key={tag}
//                                 onClick={() => navigate('/find-jobs')}
//                                 className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 px-3 py-1.5 rounded-full transition-all duration-200"
//                             >
//                                 {tag}
//                             </button>
//                         ))}
//                     </motion.div>

//                     {/* Stats */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 28 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.55, duration: 0.7 }}
//                         className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
//                     >
//                         {stats.map((stat, index) => (
//                             <motion.div
//                                 key={index}
//                                 initial={{ opacity: 0, y: 16 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 transition={{ delay: 0.65 + index * 0.08, duration: 0.5 }}
//                                 className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
//                             >
//                                 <div className="w-9 h-9 bg-linear-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center mb-2.5">
//                                     <stat.icon className="w-4 h-4 text-blue-600" />
//                                 </div>
//                                 <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
//                                     {stat.value}
//                                 </div>
//                                 <div className="text-xs text-slate-500 font-medium mt-0.5 text-center">
//                                     {stat.label}
//                                 </div>
//                             </motion.div>
//                         ))}
//                     </motion.div>

//                 </div>
//             </div>
//         </section>
//     )
// }

// export default Hero

import { motion } from "framer-motion";
import {
  Search,
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  MapPin,
  Briefcase,
  LogIn,
  BriefcaseBusiness,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import moment from "moment";

/* ── Job type badge colours ───────────────────────────── */
const typeStyles = {
  "Full-Time": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Part-Time": "bg-amber-50 text-amber-700 border-amber-100",
  Contract: "bg-violet-50 text-violet-700 border-violet-100",
  Internship: "bg-sky-50 text-sky-700 border-sky-100",
};

/* ── Single job card for the marquee ─────────────────── */
const MarqueeJobCard = ({ job, isAuthenticated, user, onNavigate }) => {
  const typeClass =
    typeStyles[job?.type] || "bg-blue-50 text-blue-700 border-blue-100";
  const isEmployer = isAuthenticated && user?.role === "employer";

  const formatSalary = (min) => {
    if (!min) return null;
    return min >= 1000 ? `₹${(min / 1000).toFixed(0)}k/m` : `₹${min}/m`;
  };

  /* Employers can view the job detail but cannot apply —
     clicking the card still navigates them to the job page */
  return (
    <div
      className="relative w-60 flex-shrink-0 mx-2.5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm
                 hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-250
                 cursor-pointer group select-none"
      onClick={() => onNavigate(`/job/${job._id}`)}
    >
      {/* Top accent on hover */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-600
                      scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-t-2xl"
      />

      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        {job?.company?.companyLogo ? (
          <img
            src={job.company.companyLogo}
            alt=""
            className="w-9 h-9 rounded-xl object-cover border border-slate-100 flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {job?.title}
          </h4>
          <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
            <Briefcase className="w-2.5 h-2.5 flex-shrink-0" />
            {job?.company?.companyName}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
          <MapPin className="w-2.5 h-2.5" />
          {job?.location}
        </span>
        {job?.type && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeClass}`}
          >
            {job?.type}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          {formatSalary(job?.salaryMin) && (
            <span className="text-sm font-bold text-slate-900">
              {formatSalary(job?.salaryMin)}
            </span>
          )}
          <p className="text-[10px] text-slate-400 mt-0.5">
            {moment(job?.createdAt).fromNow()}
          </p>
        </div>

        {/* ── Three states ── */}
        {!isAuthenticated && (
          /* Guest → prompt to sign in */
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("/login");
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600
                       bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogIn className="w-3 h-3" />
            Apply
          </button>
        )}

        {isAuthenticated && !isEmployer && (
          /* Job seeker → apply */
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/job/${job._id}`);
            }}
            className="text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700
                       px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            Apply
          </button>
        )}

        {isEmployer && (
          /* Employer → informative muted badge, no action */
          <span
            className="flex items-center gap-1 text-[10px] font-semibold text-slate-400
                           bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <BriefcaseBusiness className="w-3 h-3" />
            For job seekers
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Hero ─────────────────────────────────────────────── */
const Hero = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);

  const stats = [
    { icon: Users, label: "Active Users", value: "50,000+" },
    { icon: Building2, label: "Companies", value: "200+" },
    { icon: TrendingUp, label: "Jobs Posted", value: "25,000+" },
  ];

  const trendingTags = [
    "Remote",
    "AI / ML",
    "Full Stack",
    "Product Manager",
    "Data Science",
    "UX Design",
  ];

  /* Fetch latest jobs for the marquee */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.JOBS.GET_ALL_JOBS);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.jobs || [];
        // Sort by createdAt descending — newest first
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        const slice = sorted.slice(0, 12);
        /* Triplicate for a seamless infinite loop */
        setJobs([...slice, ...slice, ...slice]);
        setJobsLoaded(true);
      } catch (err) {
        console.log("Job marquee fetch error:", err);
        setJobsLoaded(true);
      }
    };
    fetchJobs();
  }, []);

  return (
    /* NOTE: removed min-h-screen + flex items-center so content flows naturally top→bottom */
    <section className="relative pt-24 pb-0 overflow-hidden bg-white">
      {/* ── Background mesh ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-20 -right-32 w-[28rem] h-[28rem] bg-indigo-100 rounded-full blur-3xl opacity-30" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[28rem] rounded-full blur-3xl opacity-40"
          style={{ background: "linear-gradient(to bottom, #eff6ff, #eef2ff)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #1e40af 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Main centered content ── */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            AI-Powered Job Matching Platform
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 leading-[1.12] tracking-tight"
          >
            Find Your Dream Job or{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Perfect Hire
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Connect talented professionals with innovative companies. Your next
            career move or perfect candidate is just one click away.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10"
          >
            <motion.button
              whileHover={{
                scale: 1.025,
                boxShadow: "0 8px 32px rgba(37,99,235,0.28)",
              }}
              whileTap={{ scale: 0.97 }}
              className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-blue-200 flex items-center justify-center gap-2.5"
              onClick={() => navigate("/find-jobs")}
            >
              <Search className="w-4 h-4" />
              Find Jobs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-7 py-3.5 rounded-xl font-semibold text-base hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all duration-300 shadow-sm"
              onClick={() =>
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login",
                )
              }
            >
              Post a Job
            </motion.button>
          </motion.div>

          {/* Trending Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            <span className="text-xs text-slate-400 font-medium self-center mr-1">
              Trending:
            </span>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate("/find-jobs")}
                className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 px-3 py-1.5 rounded-full transition-all duration-200"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + index * 0.08, duration: 0.5 }}
                className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center mb-2.5">
                  <stat.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5 text-center">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Job card marquee — in normal document flow, below the stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="relative z-10 mt-14 pb-14"
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-5 px-4">
          {isAuthenticated
            ? "Latest opportunities — apply now"
            : "Latest opportunities · sign in to apply"}
        </p>

        {/* Only render once jobs are loaded to avoid layout shift */}
        {jobsLoaded && jobs.length > 0 ? (
          <div className="relative overflow-hidden hirely-marquee-container">
            {/* Edge fades */}
            <div
              className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to right, white 20%, transparent)",
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to left, white 20%, transparent)",
              }}
            />

            {/* Single animated parent — BOTH copies move together.
                Pausing this one element freezes the entire track. */}
            <div className="flex items-stretch hirely-job-track">
              {/* Copy A */}
              <div className="flex items-stretch flex-shrink-0">
                {jobs.map((job, i) => (
                  <MarqueeJobCard
                    key={`a-${i}`}
                    job={job}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    onNavigate={navigate}
                  />
                ))}
              </div>
              {/* Copy B — visually identical, sits immediately after A */}
              <div
                className="flex items-stretch flex-shrink-0"
                aria-hidden="true"
              >
                {jobs.map((job, i) => (
                  <MarqueeJobCard
                    key={`b-${i}`}
                    job={job}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Skeleton placeholder while loading */
          <div className="flex gap-5 px-6 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-60 flex-shrink-0 bg-white border border-slate-100 rounded-2xl p-4 animate-pulse"
              >
                <div className="flex gap-2.5 mb-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded-lg w-4/5" />
                    <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
                  </div>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <div className="h-5 w-24 bg-slate-100 rounded-full" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-slate-100 rounded-lg" />
                  <div className="h-7 w-14 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes hirely-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Animation lives on the SINGLE parent track.
           Both copy A and copy B are children — they move as one unit.
           translateX(-50%) scrolls exactly one copy width, then loops. */
        .hirely-job-track {
          animation: hirely-scroll 42s linear infinite;
          width: max-content;
        }

        /* Pause on the OUTER container hover — this freezes the track
           (and both copies inside it) in unison. No overlap possible. */
        .hirely-marquee-container:hover .hirely-job-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .hirely-job-track { animation: none; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
