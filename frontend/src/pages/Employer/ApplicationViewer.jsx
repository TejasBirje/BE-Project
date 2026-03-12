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
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import moment from "moment";
import { getInitials } from "../../utils/helper";
import StatusBadge from "../../components/StatusBadge";
import ApplicantProfilePreview from "../../components/cards/ApplicantProfilePreview";
import toast from "react-hot-toast";

const ApplicationViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId || null;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [invitingId, setInvitingId] = useState(null);
  const [recalculatingId, setRecalculatingId] = useState(null);

  // Download resume handler
  const handleDownloadResume = (resumeUrl) => {
    if (!resumeUrl) return;
    window.open(resumeUrl, "_blank");
  };
  // Send AI Interview invite
  const handleSendInterviewInvite = async (applicationId) => {
    setInvitingId(applicationId);
    try {
      await axiosInstance.put(
        API_PATHS.APPLICATIONS.SEND_INTERVIEW_INVITE(applicationId)
      );
      setApplications((prev) =>
        prev.map((a) =>
          a._id === applicationId ? { ...a, interviewInvited: true } : a
        )
      );
      toast.success("AI Interview invitation sent!");
    } catch (err) {
      console.error("Invite error:", err);
      toast.error("Failed to send invitation");
    } finally {
      setInvitingId(null);
    }
  };

  // Re-calculate ATS score via Python microservice (for applications missing a score)
  const handleRecalculateAts = async (applicationId) => {
    setRecalculatingId(applicationId);
    try {
      const res = await axiosInstance.post(
        API_PATHS.APPLICATIONS.RECALCULATE_ATS(applicationId)
      );
      const { atsScore, atsBreakdown, atsKeywords } = res.data;
      setApplications((prev) =>
        prev
          .map((a) =>
            a._id === applicationId
              ? { ...a, atsScore, atsBreakdown, atsKeywords }
              : a
          )
          // Re-sort by ATS descending after update
          .sort((a, b) => (b.atsScore ?? -1) - (a.atsScore ?? -1))
      );
      toast.success(`ATS score updated: ${atsScore?.toFixed(1)}%`);
    } catch (err) {
      const msg = err?.response?.data?.message || "ATS recalculation failed";
      toast.error(msg);
      console.error("Recalculate ATS error:", err);
    } finally {
      setRecalculatingId(null);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId)
      );
      console.log("API Response:", response.data);
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
  // Group applications by job (server already sorted by ATS, keep order)
  const groupedApplications = useMemo(() => {
    if (!applications.length) return {};

    return applications.reduce((acc, app) => {
      const id = app?.job?._id;
      if (!id) return acc;

      if (!acc[id]) {
        acc[id] = {
          job: app.job,
          applications: [],
        };
      }

      acc[id].applications.push(app);
      return acc;
    }, {});
  }, [applications]);

  // Loader
  if (loading) {
    return (
      <DashboardLayout activeMenu={"manage-jobs"}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu={"manage-jobs"}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-8 px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-blue-600 hover:text-white transition"
              onClick={() => navigate("/manage-jobs")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <h1 className="text-xl md:text-2xl font-semibold">
              Applications Overview
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          {Object.keys(groupedApplications).length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto h-20 w-20 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">
                No Applications Available
              </h3>
              <p className="text-gray-500">
                No applications found for this job.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(groupedApplications).map(
                ({ job, applications }) => (
                  <div
                    key={job?._id}
                    className="bg-white rounded-2xl shadow border overflow-hidden"
                  >
                    {/* Job Header */}
                    <div className="bg-linear-to-r from-blue-500 to-blue-600 px-6 py-5 text-white">
                      <h2 className="text-lg font-semibold">{job?.title}</h2>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job?.location}
                        </div>

                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job?.type}
                        </div>

                        <div>{job?.category}</div>
                      </div>

                      <div className="mt-3 text-sm">
                        {applications.length} Application
                        {applications.length !== 1 ? "s" : ""}
                      </div>
                    </div>{" "}
                    {/* Applications List */}
                    <div className="p-6 space-y-4">
                      {applications.map((application, idx) => (
                        <div
                          key={application?._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                          {/* Left Side */}
                          <div className="flex items-center gap-4">
                            {/* ATS Rank Badge */}
                            <div className="hidden sm:flex flex-col items-center justify-center w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm shrink-0">
                              #{idx + 1}
                            </div>

                            {/* Avatar */}
                            <div>
                              {application?.applicant?.avatar ? (
                                <img
                                  src={application.applicant.avatar}
                                  alt={
                                    application?.applicant?.name || "Applicant"
                                  }
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {getInitials(application?.applicant?.name)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Applicant Info */}
                            <div>
                              <h3 className="font-semibold">
                                {application?.applicant?.name || "Unknown"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {application?.applicant?.email}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  Applied{" "}
                                  {moment(application?.createdAt).format(
                                    "Do MMM YYYY"
                                  )}
                                </div>{" "}
                                {/* ATS Score Pill */}
                                {application?.atsScore != null ? (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      application.atsScore >= 70
                                        ? "bg-green-100 text-green-700"
                                        : application.atsScore >= 45
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    ATS {application.atsScore.toFixed(1)}%
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRecalculateAts(application._id);
                                      }}
                                      disabled={
                                        recalculatingId === application._id
                                      }
                                      className="ml-0.5 hover:opacity-70 disabled:opacity-40 transition"
                                      title="Re-calculate ATS score"
                                    >
                                      <RefreshCw
                                        className={`h-2.5 w-2.5 ${
                                          recalculatingId === application._id
                                            ? "animate-spin"
                                            : ""
                                        }`}
                                      />
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleRecalculateAts(application._id)
                                    }
                                    disabled={
                                      recalculatingId === application._id
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 disabled:opacity-60 transition"
                                    title="Python server must be running"
                                  >
                                    <RefreshCw
                                      className={`h-3 w-3 ${
                                        recalculatingId === application._id
                                          ? "animate-spin"
                                          : ""
                                      }`}
                                    />
                                    {recalculatingId === application._id
                                      ? "Scoring…"
                                      : "Calc ATS"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4 md:mt-0 flex-wrap justify-end">
                            <StatusBadge status={application.status} />
                            <button
                              onClick={() =>
                                handleDownloadResume(
                                  application?.applicant?.resume
                                )
                              }
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                            >
                              <Download className="h-4 w-4" />
                              Resume
                            </button>
                            <button
                              onClick={() => setSelectedApplicant(application)}
                              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
                            >
                              <Eye className="h-4 w-4" />
                              Profile
                            </button>
                            {/* Send AI Interview Invite */}
                            {application.interviewInvited ? (
                              <span className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 font-medium">
                                <CheckCircle className="h-4 w-4" />
                                Invited
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleSendInterviewInvite(application._id)
                                }
                                disabled={invitingId === application._id}
                                className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-60 transition"
                              >
                                <Bot className="h-4 w-4" />
                                {invitingId === application._id
                                  ? "Sending..."
                                  : "AI Interview"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Profile Model */}
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
      </div>
    </DashboardLayout>
  );
};

export default ApplicationViewer;
