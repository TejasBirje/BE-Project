import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import {
  Building2,
  Clock,
  MapPin,
  Users,
  Bot,
  ArrowLeft,
  Bookmark,
  Share2,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  FileText,
} from "lucide-react";
import moment from "moment";

/* ── tiny helpers ─────────────────────────────────────── */
const typeStyles = {
  "Full-Time": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Part-Time": "bg-amber-50   text-amber-700   border-amber-100",
  Contract: "bg-violet-50  text-violet-700  border-violet-100",
  Internship: "bg-sky-50     text-sky-700     border-sky-100",
};

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
    <h2 className="text-base font-bold text-slate-900">{children}</h2>
  </div>
);

/* ── component ────────────────────────────────────────── */
const JobDetails = () => {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const getJobDetailsById = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.JOBS.GET_JOB_BY_ID(jobId),
        { params: { userId: user?._id || null } },
      );
      setJobDetails(response.data);
    } catch (error) {
      console.log("Error fetching job details: ", error);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async () => {
    try {
      if (!user?.resumeId) {
        toast.error(
          "Please upload a resume from your profile before applying.",
        );
        navigate("/profile");
        return;
      }
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
      toast.success("Applied to job successfully");
      getJobDetailsById();
    } catch (error) {
      const errorMsg = error?.response?.data?.message;
      toast.error(errorMsg || "Something went wrong! Try again later");
    }
  };

  const handleStartInterview = () => {
    if (!user?.resumeId) {
      toast.error(
        "Please upload a resume from your profile before starting an interview.",
      );
      navigate("/profile");
      return;
    }
    const jd = encodeURIComponent(
      `${jobDetails.title}\n\n${jobDetails.description}\n\nRequirements:\n${jobDetails.requirements}`,
    );
    navigate(`/interview?resumeId=${user.resumeId}&jd=${jd}&limit=5`);
  };

  useEffect(() => {
    if (jobId && user) getJobDetailsById();
  }, [jobId, user]);

  /* ── skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-12 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded-lg mb-8" />
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
                <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 bg-slate-200 rounded-full" />
              ))}
            </div>
            <div className="h-24 bg-slate-100 rounded-xl" />
            <div className="h-32 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!jobDetails) return null;

  const typeClass =
    typeStyles[jobDetails.type] || "bg-blue-50 text-blue-700 border-blue-100";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-22 pb-14">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium mb-6 group transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to jobs
        </button>

        {/* ── Hero card ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
          {/* Top accent stripe */}
          <div className="h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="p-5 sm:p-7">
            {/* Company + Title row */}
            <div className="flex items-start gap-4 mb-5">
              {jobDetails?.company?.companyLogo ? (
                <img
                  src={jobDetails.company.companyLogo}
                  alt="Company Logo"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-2xl border border-slate-100 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-1">
                  {jobDetails.title}
                </h1>
                {jobDetails?.company?.companyName && (
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {jobDetails.company.companyName}
                  </p>
                )}
              </div>

              {/* Share — desktop only */}
              <button
                className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors shrink-0"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              <Tag className="bg-slate-50 text-slate-600 border-slate-100">
                <MapPin className="w-3 h-3" />
                {jobDetails.location}
              </Tag>
              <Tag className={typeClass}>{jobDetails.type}</Tag>
              <Tag className="bg-blue-50 text-blue-700 border-blue-100">
                {jobDetails.category}
              </Tag>
              <Tag className="bg-slate-50 text-slate-500 border-slate-100">
                <Clock className="w-3 h-3" />
                {jobDetails.createdAt
                  ? moment(jobDetails.createdAt).format("Do MMM YYYY")
                  : "N/A"}
              </Tag>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 mb-5" />

            {/* CTA row */}
            {user?.role === "jobseeker" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Apply / Status */}
                {jobDetails?.applicationStatus ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    {jobDetails.applicationStatus}
                  </div>
                ) : (
                  <button
                    onClick={applyToJob}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-blue-200 hover:shadow-md"
                  >
                    <FileText className="w-4 h-4" />
                    Apply Now
                  </button>
                )}

                {/* AI Mock Interview */}
                <button
                  onClick={handleStartInterview}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-violet-200 hover:shadow-md"
                >
                  <Bot className="w-4 h-4" />
                  AI Mock Interview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Compensation card ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-linear-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                Compensation
              </p>
              <div className="text-lg font-bold text-slate-900">
                {jobDetails.salaryMin} – {jobDetails.salaryMax}
                <span className="text-sm text-slate-400 font-normal ml-1.5">
                  per year
                </span>
              </div>
            </div>
            <div className="flex-linear-0">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                <Users className="w-3 h-3" />
                Competitive
              </span>
            </div>
          </div>
        </div>

        {/* ── About this role ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-7 mb-4">
          <SectionHeading accent="bg-gradient-to-b from-blue-500 to-indigo-600">
            About This Role
          </SectionHeading>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4 border border-slate-100">
            {jobDetails.description}
          </div>
        </div>

        {/* ── Requirements ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-7">
          <SectionHeading accent="bg-gradient-to-b from-violet-500 to-pink-500">
            What We're Looking For
          </SectionHeading>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-violet-50/50 rounded-xl p-4 border border-violet-100">
            {jobDetails.requirements}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
