import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layout/Navbar";
import StatusBadge from "../../components/StatusBadge";
import JobCard from "./components/JobCard";
import {
  ArrowLeft,
  Bot,
  Briefcase,
  Calendar,
  FileText,
  Bookmark,
  MapPin,
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

const MyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [appsRes, savedRes] = await Promise.all([
        axiosInstance.get(API_PATHS.APPLICATIONS.GET_MY_APPLICATIONS),
        axiosInstance.get(API_PATHS.JOBS.GET_SAVED_JOBS),
      ]);

      setApplications(appsRes.data || []);
      setSavedJobs(savedRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      toast.success("Removed from saved");
      fetchData();
    } catch {
      toast.error("Error removing job");
    }
  };

  const handleStartInterview = (app) => {
    const jd = encodeURIComponent(
      `${app.job?.description || ""}\n${app.job?.requirements || ""}`
    );
    navigate(`/job/${app.job?._id}`)
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const atsColor = (score) => {
    if (score == null) return "bg-gray-100 text-gray-500";
    if (score >= 70) return "bg-green-100 text-green-700";
    if (score >= 45) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/find-jobs")}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-blue-600 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              My Applications
            </h1>
            <p className="text-sm text-gray-500">
              Track applications and manage saved jobs
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ================= LEFT: APPLICATIONS ================= */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-xl shadow border">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  My Applications ({applications.length})
                </h2>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow border">
                  <FileText className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No applications yet</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => navigate(`/job/${app.job?._id}`)}
                    className="bg-white p-5 rounded-xl shadow-lg hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {app.job?.title}
                        </h3>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.job?.location}
                          </span>

                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {moment(app.createdAt).format("Do MMM YYYY")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <StatusBadge status={app.status} />

                          {app.atsScore != null && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${atsColor(
                                app.atsScore
                              )}`}
                            >
                              ATS {app.atsScore.toFixed(1)}%
                            </span>
                          )}

                          {app.interviewInvited && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              Interview Ready
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        {app.interviewInvited ? (
                          <button
                            onClick={() => handleStartInterview(app)}
                            className="px-4 py-2 text-white rounded-lg text-sm bg-linear-to-r from-purple-700 to-blue-600 hover:from-blue-700 hover:to-purple-700 transition"                          >
                            Go to Details
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Awaiting Invite
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ================= RIGHT: SAVED JOBS ================= */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl shadow border">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-purple-600" />
                  Saved Jobs ({savedJobs.length})
                </h2>
              </div>

              {savedJobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow border">
                  <Bookmark className="h-14 w-14 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No saved jobs</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                  {savedJobs.map((item) => (
                    <JobCard
                      key={item._id}
                      job={item.job}
                      onClick={() => navigate(`/job/${item.job._id}`)}
                      onToggleSave={() => handleUnsaveJob(item.job._id)}
                      saved
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDashboard;