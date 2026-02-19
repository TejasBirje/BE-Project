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
} from "lucide-react";
import moment from "moment";
import { getInitials } from "../../utils/helper"
import StatusBadge from "../../components/StatusBadge";
import ApplicantProfilePreview from "../../components/cards/ApplicantProfilePreview";

const ApplicationViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId || null;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Download resume handler
  const handleDownloadResume = (resumeUrl) => {
    if (!resumeUrl) return;

    window.open(resumeUrl, "_blank");
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

  // Group applications by job
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
                      <h2 className="text-lg font-semibold">
                        {job?.title}
                      </h2>

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
                    </div>

                    {/* Applications List */}
                    <div className="p-6 space-y-4">
                      {applications.map((application) => (
                        <div
                          key={application?._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                          {/* Left Side */}
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div>
                              {application?.applicant?.avatar ? (
                                <img
                                  src={application.applicant.avatar}
                                  alt={
                                    application?.applicant?.name ||
                                    "Applicant"
                                  }
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold">
                                    {getInitials(
                                      application?.applicant?.name
                                    )}
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
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Calendar className="h-3 w-3" />
                                Applied{" "}
                                {moment(
                                  application?.createdAt
                                ).format("Do MMM YYYY")}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-4 md:mt-0">
                            <StatusBadge status={application.status}/>
                            <button
                              onClick={() =>
                                handleDownloadResume(
                                  application?.applicant?.resume
                                )
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                            >
                              <Download className="h-4 w-4" />
                            Resume
                            </button>

                            <button
                              onClick={() =>
                                setSelectedApplicant(application)
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
                            >
                              <Eye className="h-4 w-4" />
                              View Profile
                            </button>
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
