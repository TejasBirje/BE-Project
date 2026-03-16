// import React, { useEffect, useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import axiosInstance from '../../utils/axiosInstance';
// import { API_PATHS } from '../../utils/apiPaths';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import { ChevronDown, ChevronUp, Edit, Plus, Search, Trash2, Users, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import moment from 'moment'

// const ManageJobs = () => {

//   const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortField, setSortField] = useState("title");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [isLoading, setIsLoading] = useState(false);
//   const itemsPerPage = 8;

//   const [jobs, setJobs] = useState([]);

//   // Filter and sort jobs
//   const filteredAndSortedJobs = useMemo(() => {
//     let filtered = jobs.filter((job) => {
//       const matchesSearch =
//         job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         job.company.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesStatus =
//         statusFilter === "All" || job.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });

//     // Sort jobs
//     filtered.sort((a, b) => {
//       let aValue = a[sortField];
//       let bValue = b[sortField];

//       if (sortField === "applicants") {
//         aValue = Number(aValue);
//         bValue = Number(bValue);
//       }

//       if (sortDirection === "asc") {
//         return aValue > bValue ? 1 : -1;
//       } else {
//         return aValue < bValue ? 1 : -1;
//       }
//     });

//     return filtered;
//   }, [jobs, searchTerm, statusFilter, sortField, sortDirection]);

//   // Pagination
//   const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedJobs = filteredAndSortedJobs.slice(startIndex, startIndex + itemsPerPage);

//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? "desc" : "asc");
//     } else {
//       setSortField(field);
//       setSortDirection("asc");
//     }
//   };

//   // Toggle the status of a job
//   const handleStatusChange = async (jobId) => {
//     try {
//       const response = await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));

//       getPostedJobs(true);
//     } catch (error) {
//       console.log("Error in toggling job status: ", error);
//     }
//   };

//   // Delete a specific job
//   const handleDeleteJob = async (jobId) => {
//     try {
//       await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
//       setJobs(jobs.filter((job) => job.id !== jobId));
//       toast.success("Job listing deleted successfully");
//     } catch (error) {
//       console.log("Error deleting job: ", error);
//     }
//   };

//   // Decide which sort icon to display
//   const SortIcon = ({ field }) => {
//     if (sortField !== field) return <ChevronUp className='w-4 h-4 text-gray-400' />
//     return sortDirection === 'asc' ? (
//       <ChevronUp className='w-4 h-4 text-blue-600' />
//     ) : (
//       <ChevronDown className='w-4 h-4 text-blue-600' />
//     )
//   }

//   // Loading state with animations
//   const LoadingRow = () => (
//     <tr className='animate-pulse'>
//       <td className='px-6 py-4'>
//         <div className='flex items-center space-x-3'>
//           <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
//           <div className='space-y-2'>
//             <div className='h-4 bg-gray-200 rounded w-32'></div>
//             <div className='h-3 bg-gray-200 rounded w-24'></div>
//           </div>
//         </div>
//       </td>
//       <td className='px-6 py-4'>
//         <div className='h-6 bg-gray-200 rounded-full w-16'></div>
//       </td>
//       <td className='px-6 py-4'>
//         <div className='h-6 bg-gray-200 rounded-full w-16'></div>
//       </td>
//       <td className='px-6 py-4'>
//         <div className='flex space-x-2'>
//           <div className='h-8 bg-gray-200 rounded-full w-16'></div>
//           <div className='h-8 bg-gray-200 rounded-full w-16'></div>
//           <div className='h-8 bg-gray-200 rounded-full w-16'></div>
//         </div>
//       </td>
//     </tr>
//   );

//   const getPostedJobs = async (disableLoader) => {
//     setIsLoading(!disableLoader);
//     try {
//       const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);

//       if (response.status === 200 && response.data?.length > 0) {
//         const formattedJobs = response.data?.map((job) => ({
//           id: job._id,
//           title: job?.title,
//           company: job?.company.name || "unknown",
//           status: job?.isClosed ? "Closed" : "Active",
//           applicants: job?.applicationCount || 0,
//           datePosted: moment(job?.createdAt).format("DD-MM-YYYY"),
//           logo: job?.company?.companyLogo
//         }));

//         setJobs(formattedJobs);
//       }
//     } catch (error) {
//       if (error.response) {
//         // handle API specific errors
//         console.log(error.response.data.message);
//       } else {
//         console.log("Error posting job. Please try again");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     getPostedJobs();
//     return () => { };
//   }, [])

//   return (
//     <DashboardLayout>
//       <div className='min-h-screen p-4 sm:p-6 lg:p-8'>
//         <div className='max-w-7xl mx-auto'>
//           {/* Header */}
//           <div className='mb-8'>
//             <div className='flex flex-row items-center justify-between'>
//               <div className='mb-4 sm:mb-8'>
//                 <h1 className='text-xl md:text-2xl font-semibold text-gray-900'>
//                   Job Management
//                 </h1>
//                 <p className='text-sm text-gray-600 mt-1'>
//                   Manage your job postings and track application
//                 </p>
//               </div>

//               <button
//                 className='inline-flex items-center px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap'
//                 onClick={() => navigate("/post-job")}
//               >
//                 <Plus className="w-5 h-5 mr-2" />
//                 Add New Job
//               </button>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className='bg-white/80 backdrop:blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white/200 p-6 mb-6'>
//             <div className='flex flex-col sm:flex-row gap-4'>
//               {/* Search */}
//               <div className='flex-1 relative'>
//                 <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
//                   <Search className='h-4 w-4 text-gray-400' />
//                 </div>

//                 <input
//                   type='text'
//                   placeholder='Search Jobs...'
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className='block w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-0 transition-all duration-200 bg-gray-50/50 placeholder-gray-400'
//                 />
//               </div>

//               {/* Status Filter */}
//               <div className='sm:w-48'>
//                 <select className="block w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//                   <option value="All">All Status</option>
//                   <option value="Active">Active</option>
//                   <option value="Closed">Closed</option>
//                 </select>
//               </div>
//             </div>

//             {/* Results Summary */}
//             <div className='my-4'>
//               <p className='text-sm text-gray-600'>
//                 Showing {paginatedJobs.length} of {filteredAndSortedJobs.length}{" "}jobs
//               </p>
//             </div>

//             {/* Table */}
//             <div className='bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden'>
//               {filteredAndSortedJobs.length === 0 && !isLoading ? (
//                 <div className='text-center py-12'>
//                   <div className='w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
//                     <Search className='w-10 h-10 text-gray-400' />
//                   </div>
//                   <h3 className='text-lg font-medium text-gray-900 mb-2'>No Jobs Found</h3>
//                   <p className='text-gray-500'>Try adjusting your search or filter criteria</p>
//                 </div>
//               ) : (
//                 <div className='w-[75vw] md:w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
//                   <table className='min-w-full divide-y divide-gray-200'>
//                     <thead className='bg-linear-to-r from-gray-50 to-gray-100/50'>
//                       <tr>
//                         <th
//                           className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-all duration-200 min-w-50 sm:min-w-0'
//                           onClick={() => handleSort("title")}
//                         >
//                           <div className='flex items-center space-x-1'>
//                             <span className=''>Job Title</span>
//                             <SortIcon field={"title"} />
//                           </div>
//                         </th>
//                         <th
//                           className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-all duration-200 min-w-50 sm:min-w-0'
//                           onClick={() => handleSort("status")}
//                         >
//                           <div className='flex items-center space-x-1'>
//                             <span className=''>Status</span>
//                             <SortIcon field={"status"} />
//                           </div>
//                         </th>
//                         <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-all duration-200 min-w-50 sm:min-w-0' onClick={() => handleSort("applicants")}>
//                           <div className='flex items-center space-x-1'>
//                             <span className=''>Applicants</span>
//                             <SortIcon field={"applicants"} />
//                           </div>
//                         </th>
//                         <th className='px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider tracking-wider-[100px] sm:min-w-0' onClick={() => handleSort("applicants")}>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className='bg-white divide-y divide-gray-200'>
//                       {isLoading ? Array.from({ length: 5 }).map((_, index) => (
//                         <LoadingRow key={index} />
//                       )) : paginatedJobs.map((job) => (
//                         <tr
//                           key={job.id}
//                           className='hover:bg-blue-50/20 transition-all duration-200 border-b border-gray-100/30'
//                         >
//                           <td className='px-6 py-5 whitespace-nowrap min-w-50 sm:min-w-0'>
//                             <div>
//                               <div className='text-sm font-semibold text-gray-900'>
//                                 {job.title}
//                               </div>
//                               <div className='text-sx text-gray-500 font-medium'>
//                                 {job.company || "unknown"}
//                               </div>
//                             </div>
//                           </td>
//                           <td className='px-6 py-5 whitespace-nowrap min-w-30 sm:min-w-0'>
//                             <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full
//                               ${job.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-gray-100 text-gray-700 border border-gray-200"} `}>
//                                 {job.status}
//                               </span>
//                           </td>
//                           <td className='px-6 py-5 whitespace-nowrap min-w-32.5 sm:min-w-0'>
//                             <button
//                               className='flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold transition-color duration-200 hover:bg-blue-50 px-2 py-1 rounded-lg'
//                               onClick={() => navigate("/applicants", { state: {jobId: job.id }})}
//                             >
//                               <Users className="w-4 h-4 mr-1.5"/>
//                               {job.applicants}
//                             </button>
//                           </td>
//                           <td className='px-6 py-4 whitespace-nowrap text-sm font-medium min-w-25 sm:min-w-0'>
//                             <div className='flex space-x-2'>
//                               <button className='text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200' onClick={() => navigate("/post-job", { state: { jobId: job.id}})}>
//                                 <Edit className="w-4 h-4"/>
//                               </button>
//                               {job.status === "Active" ? (
//                                 <button
//                                   onClick={() => handleStatusChange(job.id)}
//                                   className='flex items-center gap-2 text-xs text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200'
//                                 >
//                                   <X className="w-4 h-4"/>
//                                   <span className='hidden sm:inline'>
//                                     Close
//                                   </span>
//                                 </button>
//                               ) : (
//                                 <button
//                                   onClick={() => handleStatusChange(job.id)}
//                                   className='flex items-center gap-2 text-xs text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200'
//                                 >
//                                   <Plus className='w-4 h-4'/>
//                                   <span className='hidden sm:inline'>
//                                     Activate
//                                   </span>
//                                 </button>
//                               )}
//                               <button
//                                 onClick={() => handleDeleteJob(job.id)}
//                                 className='flex items-center gap-2 text-xs text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200'
//                               >
//                                 <Trash2 className='h-4 w-4'/>
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//             <div className='mt-6 flex items-center justify-between'>
//               <div className='flex-1 flex justify-between sm:hidden'>
//                 <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
//                   Previous
//                 </button>
//                 <button className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed' onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
//                   Next
//                 </button>
//               </div>
//               <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
//                 <div>
//                   <p className='text-sm text-gray-700'>
//                     Showing{" "}
//                     <span className='font-medium'>{startIndex + 1}</span> to{" "}
//                     <span className='font-medium'>
//                       {Math.min(
//                         startIndex + itemsPerPage,
//                         filteredAndSortedJobs.length
//                       )}
//                     </span>
//                     {" "}of{" "}
//                     <span className='font-medium'>{filteredAndSortedJobs.length}</span>
//                     {" "}results
//                   </p>
//                 </div>
//               </div>
//               <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
//                 <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                   className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
//                   >
//                     Previous
//                   </button>
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => setCurrentPage(page)}
//                       className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium *:
//                         ${currentPage === page ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}

//                         `}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                   <button
//                     onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                     disabled={currentPage === totalPages}
//                     className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
//                   >
//                     Next
//                   </button>
//               </nav>
//             </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// }

// export default ManageJobs

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
