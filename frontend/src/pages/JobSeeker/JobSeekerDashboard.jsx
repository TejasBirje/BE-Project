import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Filter, Grid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import FilterContent from './components/FilterContent';
import LoadingSpinner from './components/LoadingSpinner';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import SearchHeader from './components/SearchHeader';
import JobCard from './components/JobCard';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    type: "",
    minSalary: "",
    maxSalary: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salary: true,
    categories: true,
  });

  const fetchJobs = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (filterParams.keyword) params.append("keyword", filterParams.keyword);
      if (filterParams.location) params.append("location", filterParams.location);
      if (filterParams.minSalary) params.append("minSalary", filterParams.minSalary);
      if (filterParams.maxSalary) params.append("maxSalary", filterParams.maxSalary);
      if (filterParams.type) params.append("type", filterParams.type);
      if (filterParams.category) params.append("category", filterParams.category);
      if (user) params.append("userId", user?._id);

      const response = await axiosInstance.get(
        `${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`
      );

      const jobsData = Array.isArray(response.data)
        ? response.data
        : response.data.jobs || [];

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(filters);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters, user]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    setFilters({ keyword: "", location: "", category: "", type: "", minSalary: "", maxSalary: "" });
  };

  const toggleSaveJobs = async (jobId, isCurrentlySaved) => {
    try {
      if (isCurrentlySaved) {
        await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed successfully");
      } else {
        await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully");
      }
      fetchJobs(filters);
    } catch (error) {
      console.error("Error toggling save:", error);
      toast.error("Something went wrong!");
    }
  };

  const applyToJob = async (jobId) => {
    try {
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB(jobId));
      toast.success("Applied successfully");
      fetchJobs(filters);
    } catch (error) {
      const errorMsg = error?.response?.data?.message;
      toast.error(errorMsg || "Failed to apply");
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  if (jobs.length === 0 && loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mt-16 pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search Header */}
          <SearchHeader filters={filters} handleFilterChange={handleFilterChange} />

          <div className="flex gap-6 xl:gap-8 items-start">

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-22">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
                    {activeFilterCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                </div>
                <FilterContent
                  toggleSection={toggleSection}
                  clearAllFilters={clearAllFilters}
                  expandedSections={expandedSections}
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">

              {/* Toolbar row */}
              <div className="flex items-center justify-between mb-5 gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-slate-500">
                    <span className="font-semibold text-slate-900 text-base">{jobs.length}</span>
                    <span className="ml-1.5">jobs found</span>
                  </p>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Empty State */}
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center px-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                    <Search className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-xs">
                    Try adjusting your search filters to find more opportunities.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 xl:grid-cols-2 gap-4"
                    : "flex flex-col gap-3"
                }>
                  {jobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onClick={() => navigate(`/job/${job._id}`)}
                      onToggleSave={() => toggleSaveJobs(job._id, job.isSaved)}
                      onApply={() => applyToJob(job._id)}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="px-5 py-4">
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={() => { clearAllFilters(); setShowMobileFilters(false); }}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
              >
                Show {jobs.length} Jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerDashboard;