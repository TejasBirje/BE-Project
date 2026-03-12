import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layout/Navbar";
import {
  ArrowLeft,
  Bot,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  User,
  Loader2,
} from "lucide-react";
import moment from "moment";

const InterviewReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(API_PATHS.INTERVIEW.GET(id));
        setInterview(res.data);
      } catch (err) {
        console.error("Failed to load interview:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const scoreBar = (value, max = 10) => {
    const pct = Math.round((value / max) * 100);
    const colour =
      value >= 8 ? "bg-green-500" : value >= 5 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colour}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-gray-700 w-10 text-right">
          {value}/{max}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="pt-24 px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mt-20">
            Interview not found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fb = interview.feedback || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/interview-history")}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-blue-600 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Interview Review
              </h1>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {moment(interview.createdAt).format("Do MMM YYYY, h:mm A")}
                <span className="text-gray-300">·</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    interview.status === "completed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {interview.status === "completed" ? "Completed" : "Ongoing"}
                </span>
              </p>
            </div>
          </div>

          {/* Scores */}
          {interview.status === "completed" && fb.technicalScore != null && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Performance Scores
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      Technical Score
                    </span>
                  </div>
                  {scoreBar(fb.technicalScore)}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      Communication Score
                    </span>
                  </div>
                  {scoreBar(fb.communicationScore)}
                </div>

                {interview.atsScore != null && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">
                        ATS Resume Score
                      </span>
                    </div>
                    {scoreBar(interview.atsScore, 100)}
                  </div>
                )}
              </div>

              {/* Summary */}
              {fb.summary && (
                <p className="mt-5 text-sm text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  {fb.summary}
                </p>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4 mt-5">
                {fb.strengths?.length > 0 && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-700 flex items-center gap-1 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {fb.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-green-800 flex items-start gap-1.5"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fb.weaknesses?.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-700 flex items-center gap-1 mb-2">
                      <TrendingDown className="h-4 w-4" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-1">
                      {fb.weaknesses.map((w, i) => (
                        <li
                          key={i}
                          className="text-sm text-red-800 flex items-start gap-1.5"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Questions Used */}
          {interview.questions?.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                Questions Selected ({interview.questions.length})
              </h2>
              <div className="space-y-3">
                {interview.questions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {q.topic}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            q.difficulty === "hard"
                              ? "bg-red-100 text-red-700"
                              : q.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        {q.similarity != null && (
                          <span className="text-xs text-gray-400">
                            sim: {(q.similarity * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript */}
          {interview.messages?.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Full Transcript ({interview.messages.length} messages)
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {interview.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      msg.role === "model" ? "" : "flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === "model" ? "bg-purple-100" : "bg-blue-100"
                      }`}
                    >
                      {msg.role === "model" ? (
                        <Bot className="h-4 w-4 text-purple-600" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        msg.role === "model"
                          ? "bg-gray-50 border text-gray-800"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReview;
