import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { Building2, Clock, IndianRupee, MapPin, Users, Bot } from "lucide-react";
import moment from "moment";

const JobDetails = () => {
  const { user } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);

  const getJobDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.JOBS.GET_JOB_BY_ID(jobId),
        { params: { userId: user?._id || null } }
      );
      setJobDetails(response.data);
    } catch (error) {
      console.log("Error fetching job details: ", error);
    }
  };

  const applyToJob = async () => {
    try {
      if (!user?.resumeId) {
        toast.error(
          "Please upload a resume from your profile before applying."
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
        "Please upload a resume from your profile before starting an interview."
      );
      navigate("/profile");
      return;
    }
    const jd = encodeURIComponent(
      `${jobDetails.title}\n\n${jobDetails.description}\n\nRequirements:\n${jobDetails.requirements}`
    );
    navigate(`/interview?resumeId=${user.resumeId}&jd=${jd}&limit=5`);
  };

  useEffect(() => {
    if (jobId && user) getJobDetailsById();
  }, [jobId, user]);

  return (
    <div className="bg-linear-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="w-full px-4 lg:px-12 xl:px-20 pt-24">
        {jobDetails && (
          <div className="bg-white p-6 rounded-lg">
            {/* Hero */}
            <div className="relative px-0 pb-8 border-b border-gray-100">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  {jobDetails?.company?.companyLogo ? (
                    <img
                      src={jobDetails.company.companyLogo}
                      alt="Company Logo"
                      className="h-20 w-20 object-cover rounded-2xl border-4 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h1 className="text-lg lg:text-xl font-semibold mb-2 leading-tight text-gray-900">
                      {jobDetails.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {jobDetails.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {/* AI Mock Interview button — always visible for jobseekers */}
                    {user?.role === "jobseeker" && (
                      <button
                        onClick={handleStartInterview}
                        className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-purple-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <Bot className="w-4 h-4" />
                        AI Mock Interview
                      </button>
                    )}

                    {/* Apply button */}
                    {jobDetails?.applicationStatus ? (
                      <span className="px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
                        {jobDetails.applicationStatus}
                      </span>
                    ) : (
                      user?.role === "jobseeker" && (
                        <button
                          className="text-sm text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-semibold"
                          onClick={applyToJob}
                        >
                          Apply Now
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-50 text-sm text-blue-700 font-semibold rounded-full border border-blue-200">
                    {jobDetails.category}
                  </span>
                  <span className="px-4 py-2 text-sm bg-purple-50 text-purple-700 font-semibold rounded-full border border-purple-200">
                    {jobDetails.type}
                  </span>
                  <div className="flex items-center space-x-1 px-4 py-2 bg-gray-50 text-sm text-gray-700 font-semibold rounded-full border border-gray-200">
                    <Clock className="h-4 w-4" />
                    <span>
                      {jobDetails.createdAt
                        ? moment(jobDetails.createdAt).format("Do MMM YYYY")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="px-0 pb-8 space-y-8 mt-8">
              {/* Salary */}
              <div className="relative overflow-hidden bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Compensation
                    </h3>
                    <div className="text-lg font-bold text-gray-900">
                      {jobDetails.salaryMin} - {jobDetails.salaryMax}
                      <span className="text-lg text-gray-600 font-normal ml-1">
                        per year
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center space-x-2 text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    <Users className="h-4 w-4" />
                    <span>Competitive</span>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-gray-900 flex items-center space-x-3">
                  <div className="w-1 h-8 bg-linear-to-b from-blue-500 to-purple-600 rounded-full" />
                  <span className="text-lg font-semibold">About This Role</span>
                </h3>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {jobDetails.description}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-gray-900 flex items-center space-x-3">
                  <div className="w-1 h-8 bg-linear-to-b from-purple-500 to-pink-600 rounded-full" />
                  <span className="text-lg font-semibold">
                    What we're looking for
                  </span>
                </h3>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {jobDetails.requirements}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
