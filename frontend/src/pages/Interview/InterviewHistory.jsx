import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layout/Navbar";
import {
  ArrowLeft,
  Bot,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import moment from "moment";

const InterviewHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(API_PATHS.INTERVIEW.USER_ALL);
        setInterviews(res.data || []);
      } catch (err) {
        console.error("Failed to load interviews:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const scoreColour = (score) => {
    if (score == null) return "text-gray-400";
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const statusConfig = {
    ongoing: {
      bg: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Ongoing",
    },
    completed: {
      bg: "bg-green-100 text-green-700",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Completed",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/find-jobs")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-blue-600 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Interview History
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review your past AI interview sessions and scores
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && interviews.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow border">
              <Bot className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                No interviews yet
              </h3>
              <p className="text-gray-500 mt-1 mb-6">
                Once you complete an AI interview, it will appear here.
              </p>
              <button
                onClick={() => navigate("/my-applications")}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                View My Applications
              </button>
            </div>
          )}

          {/* Interview cards */}
          {!loading && interviews.length > 0 && (
            <div className="space-y-4">
              {interviews.map((iv) => {
                const status = statusConfig[iv.status] || statusConfig.ongoing;
                return (
                  <div
                    key={iv._id}
                    className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-5 cursor-pointer"
                    onClick={() => navigate(`/interview/review/${iv._id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base">
                              AI Interview Session
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {moment(iv.createdAt).format(
                                  "Do MMM YYYY, h:mm A"
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {iv.questionLimit || 5} questions
                              </span>
                            </div>

                            {/* Scores row */}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bg}`}
                              >
                                {status.icon}
                                {status.label}
                              </span>

                              {iv.feedback?.technicalScore != null && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 ${scoreColour(
                                    iv.feedback.technicalScore
                                  )}`}
                                >
                                  <Star className="h-3 w-3" />
                                  Technical: {iv.feedback.technicalScore}/10
                                </span>
                              )}

                              {iv.feedback?.communicationScore != null && (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 ${scoreColour(
                                    iv.feedback.communicationScore
                                  )}`}
                                >
                                  <Star className="h-3 w-3" />
                                  Communication:{" "}
                                  {iv.feedback.communicationScore}/10
                                </span>
                              )}

                              {iv.atsScore != null && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                  ATS: {iv.atsScore.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right arrow */}
                      <div className="shrink-0 text-gray-400">
                        <ArrowLeft className="h-5 w-5 rotate-180" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewHistory;
