import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

/* ─── Skeleton loading row ─────────────────────────── */
const LoadingRow = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-100 rounded-lg w-36" />
          <div className="h-3 bg-slate-100 rounded-lg w-24" />
        </div>
      </div>
    </td>
    <td className="px-5 py-4">
      <div className="h-6 bg-slate-100 rounded-full w-16" />
    </td>
    <td className="px-5 py-4">
      <div className="h-6 bg-slate-100 rounded-full w-10" />
    </td>
    <td className="px-5 py-4">
      <div className="h-3 bg-slate-100 rounded-lg w-20" />
    </td>
    <td className="px-5 py-4">
      <div className="flex gap-2">
        <div className="h-7 w-7 bg-slate-100 rounded-lg" />
        <div className="h-7 w-16 bg-slate-100 rounded-lg" />
        <div className="h-7 w-7 bg-slate-100 rounded-lg" />
      </div>
    </td>
  </tr>
);

/* ─── Sort icon ────────────────────────────────────── */
const SortIcon = ({ field, sortField, sortDirection }) => {
  if (sortField !== field)
    return <ChevronUp className="w-3.5 h-3.5 text-slate-300" />;
  return sortDirection === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
  );
};

/* ─── Sortable th ─────────────────────────────────── */
const Th = ({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
  className = "",
}) => (
  <th
    className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500
                cursor-pointer hover:text-slate-700 select-none transition-colors ${className}`}
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {label}
      <SortIcon
        field={field}
        sortField={sortField}
        sortDirection={sortDirection}
      />
    </div>
  </th>
);

/* ─── Main component ──────────────────────────────── */
const ManageJobs = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const itemsPerPage = 8;

  /* ── Filter + sort ── */
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal =
        sortField === "applicants" ? Number(a[sortField]) : a[sortField];
      let bVal =
        sortField === "applicants" ? Number(b[sortField]) : b[sortField];
      return sortDirection === "asc"
        ? aVal > bVal
          ? 1
          : -1
        : aVal < bVal
          ? 1
          : -1;
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, sortField, sortDirection]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredAndSortedJobs.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusChange = async (jobId) => {
    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      getPostedJobs(true);
    } catch (error) {
      console.log("Error toggling job status:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
      setJobs(jobs.filter((job) => job.id !== jobId));
      toast.success("Job listing deleted successfully");
    } catch (error) {
      console.log("Error deleting job:", error);
    }
  };

  const getPostedJobs = async (disableLoader) => {
    setIsLoading(!disableLoader);
    try {
      const response = await axiosInstance.get(
        API_PATHS.JOBS.GET_JOBS_EMPLOYER,
      );
      if (response.status === 200 && response.data?.length > 0) {
        setJobs(
          response.data.map((job) => ({
            id: job._id,
            title: job?.title,
            company: job?.company.name || "Unknown",
            status: job?.isClosed ? "Closed" : "Active",
            applicants: job?.applicationCount || 0,
            datePosted: moment(job?.createdAt).format("DD MMM YYYY"),
            logo: job?.company?.companyLogo,
          })),
        );
      }
    } catch (error) {
      console.log("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPostedJobs();
    return () => {};
  }, []);

  /* Reset to page 1 when filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const activeCount = jobs.filter((j) => j.status === "Active").length;
  const closedCount = jobs.filter((j) => j.status === "Closed").length;

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-7xl mx-auto pb-12">
        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Job Management
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your postings and track applications
            </p>
          </div>
          <button
            onClick={() => navigate("/post-job")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                       px-5 py-2.5 rounded-xl shadow-sm shadow-blue-200 hover:shadow-md transition-all duration-200
                       active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        {/* ── Summary pills ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            {
              label: "Total",
              count: jobs.length,
              cls: "bg-slate-50 text-slate-700 border-slate-200",
            },
            {
              label: "Active",
              count: activeCount,
              cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              label: "Closed",
              count: closedCount,
              cls: "bg-slate-100 text-slate-500 border-slate-200",
            },
          ].map(({ label, count, cls }) => (
            <div
              key={label}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${cls}`}
            >
              <Briefcase className="w-3 h-3" />
              {count} {label}
            </div>
          ))}
        </div>

        {/* ── Filters + table card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by job title or company…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all
                           placeholder:text-slate-400 text-slate-800"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-44 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                         focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-700 transition-all"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Results count */}
          <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {paginatedJobs.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredAndSortedJobs.length}
              </span>{" "}
              jobs
            </p>
          </div>

          {/* Table */}
          {filteredAndSortedJobs.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                No jobs found
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <Th
                      label="Job Title"
                      field="title"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className="min-w-[200px]"
                    />
                    <Th
                      label="Status"
                      field="status"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <Th
                      label="Applicants"
                      field="applicants"
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 min-w-[120px]">
                      Date Posted
                    </th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <LoadingRow key={i} />
                      ))
                    : paginatedJobs.map((job) => (
                        <tr
                          key={job.id}
                          className="hover:bg-slate-50/70 transition-colors duration-150 group"
                        >
                          {/* Title + company */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {job.logo ? (
                                <img
                                  src={job.logo}
                                  alt=""
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Briefcase className="w-4 h-4 text-blue-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {job.title}
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                  {job.company}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status badge */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                                job.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${job.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}
                              />
                              {job.status}
                            </span>
                          </td>

                          {/* Applicants */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                navigate("/applicants", {
                                  state: { jobId: job.id },
                                })
                              }
                              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-xl transition-all duration-150"
                            >
                              <Users className="w-3.5 h-3.5" />
                              {job.applicants}
                            </button>
                          </td>

                          {/* Date posted */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-xs text-slate-400 font-medium">
                              {job.datePosted}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* Edit */}
                              <button
                                onClick={() =>
                                  navigate("/post-job", {
                                    state: { jobId: job.id },
                                  })
                                }
                                title="Edit job"
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-150"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle status */}
                              {job.status === "Active" ? (
                                <button
                                  onClick={() => handleStatusChange(job.id)}
                                  title="Close job"
                                  className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 hover:text-amber-800 hover:bg-amber-50 border border-amber-100 hover:border-amber-200 px-2.5 py-1.5 rounded-xl transition-all duration-150"
                                >
                                  <X className="w-3 h-3" />
                                  <span className="hidden sm:inline">
                                    Close
                                  </span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusChange(job.id)}
                                  title="Activate job"
                                  className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 px-2.5 py-1.5 rounded-xl transition-all duration-150"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span className="hidden sm:inline">
                                    Activate
                                  </span>
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                title="Delete job"
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>
                –
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredAndSortedJobs.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredAndSortedJobs.length}
                </span>{" "}
                results
              </p>

              <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs font-semibold rounded-xl transition-all duration-150 ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;
