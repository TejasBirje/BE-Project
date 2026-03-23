import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  MapPin,
  IndianRupee,
  Briefcase,
  Users,
  Eye,
  Send,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths.js";
import axiosInstance from "../../utils/axiosInstance.js";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import toast from "react-hot-toast";
import InputField from "../../components/input/InputField";
import SelectField from "../../components/input/SelectField";
import TextareaField from "../../components/input/TextareaField";
import JobPostingPreview from "../../components/cards/JobPostingPreview.jsx";

/* ── Progress step indicator ── */
const steps = ["Basic Info", "Details", "Compensation"];

const StepIndicator = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                done
                  ? "bg-blue-600 border-blue-600 text-white"
                  : active
                    ? "bg-white border-blue-600 text-blue-600"
                    : "bg-white border-slate-200 text-slate-400"
              }`}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${
                active
                  ? "text-blue-600"
                  : done
                    ? "text-slate-600"
                    : "text-slate-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-300 ${
                done ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Which step each field belongs to ── */
const getStep = (formData) => {
  const hasBasic =
    formData.jobTitle &&
    formData.location &&
    formData.category &&
    formData.jobType;
  const hasDetails = formData.description && formData.requirements;
  if (!hasBasic) return 0;
  if (!hasDetails) return 1;
  return 2;
};

const JobPostingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId || null;

  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    category: "",
    jobType: "",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (data) => {
    const e = {};
    if (!data.jobTitle.trim()) e.jobTitle = "Job title is required";
    if (!data.category) e.category = "Please select a category";
    if (!data.jobType) e.jobType = "Please select a job type";
    if (!data.description.trim()) e.description = "Job description is required";
    if (!data.requirements.trim())
      e.requirements = "Job requirements are required";
    if (!data.salaryMin || !data.salaryMax) {
      e.salary = "Both minimum and maximum salary are required";
    } else if (parseInt(data.salaryMin) >= parseInt(data.salaryMax)) {
      e.salary = "Maximum salary must be greater than minimum salary";
    }
    return e;
  };

  const isFormValid = () => Object.keys(validateForm(formData)).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validateForm(formData);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    setIsSubmitting(true);
    const jobPayload = {
      title: formData.jobTitle,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      category: formData.category,
      type: formData.jobType,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
    };

    try {
      const response = jobId
        ? await axiosInstance.put(API_PATHS.JOBS.UPDATE_JOB(jobId), jobPayload)
        : await axiosInstance.post(API_PATHS.JOBS.POST_JOB, jobPayload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          jobId ? "Job Updated Successfully!" : "Job Posted Successfully!",
        );
        setFormData({
          jobTitle: "",
          location: "",
          category: "",
          jobType: "",
          description: "",
          requirements: "",
          salaryMin: "",
          salaryMax: "",
        });
        navigate("/employer-dashboard");
        return;
      }
      toast.error("Something went wrong. Please try again.");
    } catch (error) {
      console.log("Unexpected error: ", error);
      toast.error("Failed to post/update job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      try {
        const response = await axiosInstance.get(
          API_PATHS.JOBS.GET_JOB_BY_ID(jobId),
        );
        const jobData = response.data;
        if (jobData) {
          setFormData((prev) => ({
            ...prev,
            jobTitle: jobData.title || "",
            location: jobData.location || "",
            category: jobData.category || "",
            jobType: jobData.jobType || "",
            description: jobData.description || "",
            requirements: jobData.requirements || "",
            salaryMin: jobData.salaryMin || 0,
            salaryMax: jobData.salaryMax || 0,
          }));
        }
      } catch (error) {
        console.log("Error fetching job details", error);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  if (isPreview) {
    return (
      <DashboardLayout activeMenu="post-job">
        <JobPostingPreview formData={formData} setIsPreview={setIsPreview} />
      </DashboardLayout>
    );
  }

  const currentStep = getStep(formData);

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="max-w-2xl mx-auto pb-12">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {jobId ? "Edit Job Posting" : "Post a New Job"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {jobId
                ? "Update your job listing details below"
                : "Fill out the form to publish a new position"}
            </p>
          </div>

          <button
            onClick={() => setIsPreview(true)}
            disabled={!isFormValid()}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Step progress */}
        <StepIndicator current={currentStep} />

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Section: Basic Info */}
          <div className="px-6 pt-6 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">
                Basic Information
              </h2>
            </div>

            <div className="space-y-4">
              <InputField
                label="Job Title"
                id="jobTitle"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                error={errors.jobTitle}
                required
                icon={Briefcase}
              />

              <InputField
                id="location"
                label="Location"
                placeHolder="e.g. Mumbai, India"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                error={errors.location}
                icon={MapPin}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  options={CATEGORIES}
                  placeHolder="Select Category"
                  error={errors.category}
                  required
                  icon={Users}
                />
                <SelectField
                  label="Job Type"
                  id="jobType"
                  value={formData.jobType}
                  onChange={(e) => handleInputChange("jobType", e.target.value)}
                  options={JOB_TYPES}
                  placeHolder="Select Job Type"
                  error={errors.jobType}
                  required
                  icon={Briefcase}
                />
              </div>
            </div>
          </div>

          {/* Section: Details */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">
                Job Details
              </h2>
            </div>

            <div className="space-y-4">
              <TextareaField
                label="Job Description"
                id="description"
                placeholder="Describe the role and responsibilities..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                error={errors.description}
                helperText="Include key responsibilities, day-to-day tasks, team structure, etc."
                required
              />
              <TextareaField
                label="Requirements"
                id="requirements"
                placeholder="List requirements and skills..."
                value={formData.requirements}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                error={errors.requirements}
                helperText="Include required skills, experience level, education, certifications, etc."
                required
              />
            </div>
          </div>

          {/* Section: Compensation */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <IndianRupee className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">
                Compensation
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Salary Range (per year) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    placeholder="Minimum"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      handleInputChange("salaryMin", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    placeholder="Maximum"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      handleInputChange("salaryMax", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              {errors.salary && (
                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.salary}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-5">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 text-sm font-semibold text-white
                       bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200
                       shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 active:scale-[0.99]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {jobId ? "Update Job" : "Publish Job"}
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;
