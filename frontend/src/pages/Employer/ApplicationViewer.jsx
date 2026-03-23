import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Download,
  Eye,
  MapPin,
  Users,
  Bot,
  CheckCircle2,
  RefreshCw,
  Trophy,
  TrendingUp,
  Award,
} from "lucide-react";
import moment from "moment";
import { getInitials } from "../../utils/helper";
import StatusBadge from "../../components/StatusBadge";
import ApplicantProfilePreview from "../../components/cards/ApplicantProfilePreview";
import toast from "react-hot-toast";

/* ── ATS score colour helper ── */
const atsStyle = (score) => {
  if (score >= 70)
    return {
      pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      bar: "bg-emerald-500",
    };
  if (score >= 45)
    return {
      pill: "bg-amber-50 text-amber-700 border border-amber-100",
      bar: "bg-amber-400",
    };
  return {
    pill: "bg-red-50 text-red-600 border border-red-100",
    bar: "bg-red-400",
  };
};

/* ── Rank badge (gold / silver / bronze for top 3) ── */
const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="hidden sm:flex w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 items-center justify-center flex-shrink-0">
        <Trophy className="w-3.5 h-3.5 text-amber-500" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center flex-shrink-0">
        <Award className="w-3.5 h-3.5 text-slate-500" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="hidden sm:flex w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 items-center justify-center flex-shrink-0">
        <Award className="w-3.5 h-3.5 text-orange-400" />
      </div>
    );
  return (
    <div className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center flex-shrink-0">
      <span className="text-[11px] font-bold text-slate-400">#{rank}</span>
    </div>
  );
};

/* ── Avatar ── */
const Avatar = ({ applicant }) => {
  const initials = getInitials(applicant?.name);
  const colours = [
    "from-blue-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-pink-400 to-rose-500",
  ];
  const gradient =
    colours[(applicant?.name?.charCodeAt(0) || 0) % colours.length];

  if (applicant?.avatar) {
    return (
      <img
        src={applicant.avatar}
        alt={applicant.name}
        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
      />
    );
  }
  return (
    <div
      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
    >
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
};

/* ── Loading skeleton ── */
const LoadingSkeleton = () => (
  <DashboardLayout activeMenu="manage-jobs">
    <div className="max-w-4xl mx-auto pb-12 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded-lg mb-8" />
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="h-24 bg-slate-100" />
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border border-slate-100"
            >
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/4" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/5" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-slate-100 rounded-xl" />
                <div className="h-8 w-20 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>
);

/* ─── Main component ─────────────────────────────── */
const ApplicationViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId || null;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [invitingId, setInvitingId] = useState(null);
  const [recalculatingId, setRecalculatingId] = useState(null);

  const handleDownloadResume = (resumeUrl) => {
    if (!resumeUrl) return;
    window.open(resumeUrl, "_blank");
  };

  const handleSendInterviewInvite = async (applicationId) => {
    setInvitingId(applicationId);
    try {
      await axiosInstance.put(
        API_PATHS.APPLICATIONS.SEND_INTERVIEW_INVITE(applicationId),
      );
      setApplications((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, interviewInvited: true } : a,
        ),
      );
      toast.success("AI Interview invitation sent!");
    } catch (err) {
      console.error("Invite error:", err);
      toast.error("Failed to send invitation");
    } finally {
      setInvitingId(null);
    }
  };

  const handleRecalculateAts = async (applicationId) => {
    setRecalculatingId(applicationId);
    try {
      const res = await axiosInstance.post(
        API_PATHS.APPLICATIONS.RECALCULATE_ATS(applicationId),
      );
      const { atsScore, atsBreakdown, atsKeywords } = res.data;
      setApplications((prev) =>
        prev
          .map((a) =>
            a._id === applicationId
              ? { ...a, atsScore, atsBreakdown, atsKeywords }
              : a,
          )
          .sort((a, b) => (b.atsScore ?? -1) - (a.atsScore ?? -1)),
      );
      toast.success(`ATS score updated: ${atsScore?.toFixed(1)}%`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "ATS recalculation failed");
    } finally {
      setRecalculatingId(null);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId),
      );
      setApplications(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) {
      navigate("/manage-jobs");
      return;
    }
    fetchApplications();
  }, [jobId, navigate]);

  const groupedApplications = useMemo(() => {
    if (!applications.length) return {};
    return applications.reduce((acc, app) => {
      const id = app?.job?._id;
      if (!id) return acc;
      if (!acc[id]) acc[id] = { job: app.job, applications: [] };
      acc[id].applications.push(app);
      return acc;
    }, {});
  }, [applications]);

  if (loading) return <LoadingSkeleton />;

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-5xl mx-auto pb-12">
        {/* ── Page header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/manage-jobs")}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Applications Overview
          </h1>
        </div>

        {/* ── Empty state ── */}
        {Object.keys(groupedApplications).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              No applications yet
            </h3>
            <p className="text-sm text-slate-400 max-w-xs">
              No one has applied to this job yet. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedApplications).map(({ job, applications }) => (
              <div
                key={job?._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* ── Job header band ── */}
                <div className="relative px-5 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
                  {/* Subtle dot texture */}
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, white 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                    }}
                  />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-white mb-2">
                        {job?.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                          <MapPin className="w-3 h-3" /> {job?.location}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                          <Briefcase className="w-3 h-3" /> {job?.type}
                        </span>
                        <span className="text-xs text-blue-100 font-medium">
                          {job?.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Users className="w-3 h-3" />
                        {applications.length} applicant
                        {applications.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Applicant rows ── */}
                <div className="divide-y divide-slate-100">
                  {applications.map((application, idx) => {
                    const style =
                      application?.atsScore != null
                        ? atsStyle(application.atsScore)
                        : null;
                    const isInviting = invitingId === application._id;
                    const isRecalc = recalculatingId === application._id;

                    return (
                      <div
                        key={application?._id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors duration-150 group"
                      >
                        {/* Left: rank + avatar + info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <RankBadge rank={idx + 1} />

                          <Avatar applicant={application?.applicant} />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {application?.applicant?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {application?.applicant?.email}
                            </p>

                            {/* Meta row: date + ATS score */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Calendar className="w-3 h-3" />
                                Applied{" "}
                                {moment(application?.createdAt).format(
                                  "Do MMM YYYY",
                                )}
                              </span>

                              {/* ATS score pill */}
                              {application?.atsScore != null ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.pill}`}
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  ATS {application.atsScore.toFixed(1)}%
                                  {/* Mini progress bar */}
                                  <span className="w-10 h-1 bg-white/60 rounded-full overflow-hidden">
                                    <span
                                      className={`block h-full ${style.bar} rounded-full`}
                                      style={{
                                        width: `${Math.min(application.atsScore, 100)}%`,
                                      }}
                                    />
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRecalculateAts(application._id);
                                    }}
                                    disabled={isRecalc}
                                    title="Re-calculate ATS score"
                                    className="hover:opacity-70 disabled:opacity-40 transition ml-0.5"
                                  >
                                    <RefreshCw
                                      className={`w-2.5 h-2.5 ${isRecalc ? "animate-spin" : ""}`}
                                    />
                                  </button>
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleRecalculateAts(application._id)
                                  }
                                  disabled={isRecalc}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 disabled:opacity-60 transition"
                                >
                                  <RefreshCw
                                    className={`w-2.5 h-2.5 ${isRecalc ? "animate-spin" : ""}`}
                                  />
                                  {isRecalc ? "Scoring…" : "Calculate ATS"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: status + action buttons */}
                        <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0 lg:justify-end">
                          <StatusBadge status={application.status} />

                          {/* Download resume */}
                          <button
                            onClick={() =>
                              handleDownloadResume(
                                application?.applicant?.resume,
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-3 py-2 rounded-xl transition-all duration-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Resume
                          </button>

                          {/* View profile */}
                          <button
                            onClick={() => setSelectedApplicant(application)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 px-3 py-2 rounded-xl transition-all duration-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Profile
                          </button>

                          {/* AI Interview invite */}
                          {application.interviewInvited ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100 bg-emerald-50 px-3 py-2 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Invited
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleSendInterviewInvite(application._id)
                              }
                              disabled={isInviting}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 px-3 py-2 rounded-xl transition-all duration-200 shadow-sm shadow-violet-200"
                            >
                              {isInviting ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                  Sending…
                                </>
                              ) : (
                                <>
                                  <Bot className="w-3.5 h-3.5" />
                                  AI Interview
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selectedApplicant && (
        <ApplicantProfilePreview
          selectedApplicant={selectedApplicant}
          setSelectedApplicant={setSelectedApplicant}
          handleDownloadResume={handleDownloadResume}
          handleClose={() => {
            setSelectedApplicant(null);
            fetchApplications();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ApplicationViewer;
