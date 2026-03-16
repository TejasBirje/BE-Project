// import React, { useState } from "react";
// import axiosInstance from "../../utils/axiosInstance";
// import { API_PATHS } from "../../utils/apiPaths";
// import toast from "react-hot-toast";
// import { Bot, CheckCircle, Download, X } from "lucide-react";
// import { getInitials } from "../../utils/helper";
// import StatusBadge from "../StatusBadge";
// import moment from "moment";

// const statusOptions = ["Applied", "Under Review", "Rejected", "Accepted"];

// const ApplicantProfilePreview = ({
//   selectedApplicant,
//   setSelectedApplicant,
//   handleDownloadResume,
//   handleClose,
// }) => {
//   const [currentStatus, setCurrentStatus] = useState(selectedApplicant.status);
//   const [loading, setLoading] = useState(false);
//   const [invited, setInvited] = useState(
//     selectedApplicant.interviewInvited || false,
//   );
//   const [inviting, setInviting] = useState(false);

//   const onChangeStatus = async (e) => {
//     const newStatus = e.target.value;
//     setCurrentStatus(newStatus);
//     setLoading(true);

//     try {
//       const response = await axiosInstance.put(
//         API_PATHS.APPLICATIONS.UPDATE_STATUS(selectedApplicant._id),
//         { status: newStatus },
//       );

//       if (response.status === 200) {
//         setSelectedApplicant({ ...selectedApplicant, status: newStatus });
//         toast.success("Application status updated successfully");
//       }
//     } catch (error) {
//       console.log("Error updating status: ", error);
//       setCurrentStatus(selectedApplicant.status);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendInvite = async () => {
//     setInviting(true);
//     try {
//       await axiosInstance.put(
//         API_PATHS.APPLICATIONS.SEND_INTERVIEW_INVITE(selectedApplicant._id),
//       );
//       setInvited(true);
//       setSelectedApplicant({ ...selectedApplicant, interviewInvited: true });
//       toast.success("AI Interview invitation sent!");
//     } catch (error) {
//       console.log("Invite error:", error);
//       toast.error("Failed to send invitation");
//     } finally {
//       setInviting(false);
//     }
//   };

//   // ATS score colour helper
//   const atsColour = (score) => {
//     if (score == null)
//       return { bar: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-50" };
//     if (score >= 70)
//       return { bar: "bg-green-500", text: "text-green-700", bg: "bg-green-50" };
//     if (score >= 45)
//       return {
//         bar: "bg-yellow-500",
//         text: "text-yellow-700",
//         bg: "bg-yellow-50",
//       };
//     return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50" };
//   };

//   const ats = selectedApplicant.atsScore;
//   const breakdown = selectedApplicant.atsBreakdown || {};
//   const colours = atsColour(ats);

//   return (
//     <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-6 border-3 border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-900">
//             Applicant Profile
//           </h3>
//           <button
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//             onClick={() => handleClose()}
//           >
//             <X className="h-5 w-5 text-gray-500" />
//           </button>
//         </div>
//         {/* Model Content */}
//         <div className="p-6">
//           <div className="text-center mb-6">
//             {selectedApplicant.applicant.avatar ? (
//               <img
//                 src={selectedApplicant.applicant.avatar}
//                 alt={selectedApplicant.applicant.name}
//                 className="h-20 w-20 rounded-full object-cover mx-auto"
//               />
//             ) : (
//               <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
//                 <span className="text-blue-600 font-semibold text-4xl">
//                   {getInitials(selectedApplicant.applicant.name)}
//                 </span>
//               </div>
//             )}
//             <h4 className="mt-4 text-xl font-semibold text-gray-900">
//               {selectedApplicant.applicant.name}
//             </h4>
//             <p className="text-gray-600">{selectedApplicant.applicant.email}</p>
//           </div>
//           <div className="space-y-4">
//             <div className="bg-gray-50 rounded-lg p-4">
//               <h5 className="font-medium text-gray-900 mb-2">
//                 Applied Position
//               </h5>
//               <p className="text-gray-700">{selectedApplicant.job.title}</p>
//               <p className="text-gray-600 text-sm mt-1">
//                 {selectedApplicant.job.location} · {selectedApplicant.job.type}
//               </p>
//             </div>

//             {/* ATS Score Section */}
//             <div className={`rounded-lg p-4 border ${colours.bg}`}>
//               <div className="flex items-center justify-between mb-3">
//                 <h5 className="font-medium text-gray-900">ATS Score</h5>
//                 {ats != null ? (
//                   <span className={`text-lg font-bold ${colours.text}`}>
//                     {ats.toFixed(1)}%
//                   </span>
//                 ) : (
//                   <span className="text-sm text-gray-400 italic">Pending…</span>
//                 )}
//               </div>

//               {ats != null && (
//                 <>
//                   {/* Overall progress bar */}
//                   <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
//                     <div
//                       className={`h-2 rounded-full transition-all ${colours.bar}`}
//                       style={{ width: `${Math.min(ats, 100)}%` }}
//                     />
//                   </div>

//                   {/* Breakdown rows */}
//                   {[
//                     { label: "Experience", value: breakdown.experience },
//                     { label: "Skills", value: breakdown.skills },
//                     { label: "Education", value: breakdown.education },
//                     {
//                       label: "Bonus pts",
//                       value: breakdown.bonus,
//                       isBonus: true,
//                     },
//                   ].map(({ label, value, isBonus }) =>
//                     value != null ? (
//                       <div
//                         key={label}
//                         className="flex items-center justify-between text-xs text-gray-600 mb-1"
//                       >
//                         <span>{label}</span>
//                         <span
//                           className={`font-medium ${
//                             isBonus ? "text-purple-600" : colours.text
//                           }`}
//                         >
//                           {isBonus ? `+${value} pts` : `${value.toFixed(1)}%`}
//                         </span>
//                       </div>
//                     ) : null,
//                   )}

//                   {/* Matched keywords */}
//                   {selectedApplicant.atsKeywords?.matched?.length > 0 && (
//                     <div className="mt-2">
//                       <p className="text-xs text-gray-500 mb-1">
//                         Matched keywords:
//                       </p>
//                       <div className="flex flex-wrap gap-1">
//                         {selectedApplicant.atsKeywords.matched
//                           .slice(0, 10)
//                           .map((kw) => (
//                             <span
//                               key={kw}
//                               className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
//                             >
//                               {kw}
//                             </span>
//                           ))}
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>

//             <div className="bg-gray-50 rounded-lg p-4">
//               <h5 className="font-medium text-gray-900 mb-2">
//                 Application Details
//               </h5>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Status:</span>
//                   <StatusBadge status={currentStatus} />
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Applied Date:</span>
//                   <span className="text-gray-900">
//                     {moment(selectedApplicant.createdAt)?.format("Do MMM YYYY")}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <button
//               className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
//               onClick={() =>
//                 handleDownloadResume(selectedApplicant.applicant.resume)
//               }
//             >
//               <Download className="h-4 w-4" />
//               Download Resume
//             </button>

//             {/* AI Interview Invite Button */}
//             {invited ? (
//               <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg border border-green-200">
//                 <CheckCircle className="h-4 w-4" />
//                 AI Interview Invitation Sent
//               </div>
//             ) : (
//               <button
//                 onClick={handleSendInvite}
//                 disabled={inviting}
//                 className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors"
//               >
//                 <Bot className="h-4 w-4" />
//                 {inviting ? "Sending Invitation…" : "Send AI Interview Invite"}
//               </button>
//             )}

//             {/* Status Dropdown */}
//             <div className="mt-2">
//               <label className="block mb-1 text-sm text-gray-700 font-medium">
//                 Change Application Status
//               </label>
//               <select
//                 value={currentStatus}
//                 onChange={onChangeStatus}
//                 disabled={loading}
//                 className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 {statusOptions.map((status) => (
//                   <option key={status} value={status}>
//                     {status}
//                   </option>
//                 ))}
//               </select>
//               {loading && (
//                 <p className="text-xs text-gray-500 mt-1">Updating Status…</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApplicantProfilePreview;

import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import {
  Bot,
  CheckCircle2,
  Download,
  X,
  MapPin,
  Briefcase,
  Calendar,
  TrendingUp,
  Tag,
  ChevronDown,
} from "lucide-react";
import { getInitials } from "../../utils/helper";
import StatusBadge from "../StatusBadge";
import moment from "moment";

const statusOptions = ["Applied", "Under Review", "Rejected", "Accepted"];

/* ── ATS colour helper ── */
const atsStyle = (score) => {
  if (score == null)
    return {
      bar: "bg-slate-300",
      text: "text-slate-500",
      bg: "bg-slate-50 border-slate-200",
      label: "bg-slate-100 text-slate-500",
    };
  if (score >= 70)
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-100",
      label: "bg-emerald-100 text-emerald-700",
    };
  if (score >= 45)
    return {
      bar: "bg-amber-400",
      text: "text-amber-700",
      bg: "bg-amber-50 border-amber-100",
      label: "bg-amber-100 text-amber-700",
    };
  return {
    bar: "bg-red-400",
    text: "text-red-600",
    bg: "bg-red-50 border-red-100",
    label: "bg-red-100 text-red-600",
  };
};

/* ── Avatar ── */
const Avatar = ({ applicant }) => {
  const gradients = [
    "from-blue-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-pink-400 to-rose-500",
  ];
  const gradient =
    gradients[(applicant?.name?.charCodeAt(0) || 0) % gradients.length];

  if (applicant?.avatar) {
    return (
      <img
        src={applicant.avatar}
        alt={applicant.name}
        className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
      />
    );
  }
  return (
    <div
      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
    >
      <span className="text-white text-2xl font-bold">
        {getInitials(applicant?.name)}
      </span>
    </div>
  );
};

const ApplicantProfilePreview = ({
  selectedApplicant,
  setSelectedApplicant,
  handleDownloadResume,
  handleClose,
}) => {
  const [currentStatus, setCurrentStatus] = useState(selectedApplicant.status);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(
    selectedApplicant.interviewInvited || false,
  );
  const [inviting, setInviting] = useState(false);

  const onChangeStatus = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.APPLICATIONS.UPDATE_STATUS(selectedApplicant._id),
        { status: newStatus },
      );
      if (response.status === 200) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
        toast.success("Application status updated");
      }
    } catch (error) {
      console.log("Error updating status:", error);
      setCurrentStatus(selectedApplicant.status);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    setInviting(true);
    try {
      await axiosInstance.put(
        API_PATHS.APPLICATIONS.SEND_INTERVIEW_INVITE(selectedApplicant._id),
      );
      setInvited(true);
      setSelectedApplicant({ ...selectedApplicant, interviewInvited: true });
      toast.success("AI Interview invitation sent!");
    } catch (error) {
      console.log("Invite error:", error);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const ats = selectedApplicant.atsScore;
  const breakdown = selectedApplicant.atsBreakdown || {};
  const colours = atsStyle(ats);

  return (
    /* Backdrop — no backdrop-blur for performance */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60"
      onClick={handleClose}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header: avatar + name + close all in one flat row ── */}
        <div className="bg-gradient-to-r from-blue-400 to-indigo-400 px-5 pt-5 pb-5 rounded-t-2xl">
          {/* Close */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClose}
              className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Avatar + name row — no overlap, everything stays inside the header */}
          <div className="flex items-center gap-4">
            <Avatar applicant={selectedApplicant.applicant} />
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white truncate">
                {selectedApplicant.applicant.name}
              </h4>
              <p className="text-sm text-blue-200 truncate mt-0.5">
                {selectedApplicant.applicant.email}
              </p>
              <div className="mt-2">
                <StatusBadge status={currentStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-5 pb-6 space-y-4">
          {/* Applied position */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Applied Position
            </p>
            <p className="text-sm font-semibold text-slate-900 mb-1.5">
              {selectedApplicant.job.title}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" /> {selectedApplicant.job.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Briefcase className="w-3 h-3" /> {selectedApplicant.job.type}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />{" "}
                {moment(selectedApplicant.createdAt).format("Do MMM YYYY")}
              </span>
            </div>
          </div>

          {/* ATS Score */}
          <div className={`rounded-xl p-4 border ${colours.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${colours.text}`} />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  ATS Score
                </p>
              </div>
              {ats != null ? (
                <span className={`text-xl font-bold ${colours.text}`}>
                  {ats.toFixed(1)}%
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">Pending…</span>
              )}
            </div>

            {ats != null && (
              <>
                {/* Overall bar */}
                <div className="w-full bg-white/60 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${colours.bar}`}
                    style={{ width: `${Math.min(ats, 100)}%` }}
                  />
                </div>

                {/* Breakdown rows */}
                <div className="space-y-2 mb-3">
                  {[
                    { label: "Experience", value: breakdown.experience },
                    { label: "Skills", value: breakdown.skills },
                    { label: "Education", value: breakdown.education },
                    {
                      label: "Bonus pts",
                      value: breakdown.bonus,
                      isBonus: true,
                    },
                  ].map(({ label, value, isBonus }) =>
                    value != null ? (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="text-xs text-slate-500 w-20 flex-shrink-0">
                          {label}
                        </span>
                        {/* Mini bar */}
                        {!isBonus && (
                          <div className="flex-1 bg-white/60 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colours.bar}`}
                              style={{ width: `${Math.min(value, 100)}%` }}
                            />
                          </div>
                        )}
                        <span
                          className={`text-xs font-semibold flex-shrink-0 ${isBonus ? "text-violet-600" : colours.text}`}
                        >
                          {isBonus ? `+${value} pts` : `${value.toFixed(1)}%`}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>

                {/* Matched keywords */}
                {selectedApplicant.atsKeywords?.matched?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Matched Keywords
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApplicant.atsKeywords.matched
                        .slice(0, 10)
                        .map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-full"
                          >
                            {kw}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            {/* Download resume */}
            <button
              onClick={() =>
                handleDownloadResume(selectedApplicant.applicant.resume)
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Download Resume
            </button>

            {/* AI Interview invite */}
            {invited ? (
              <div className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                AI Interview Invitation Sent
              </div>
            ) : (
              <button
                onClick={handleSendInvite}
                disabled={inviting}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 rounded-xl transition-all duration-200 shadow-sm shadow-violet-200"
              >
                {inviting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending Invitation…
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Send AI Interview Invite
                  </>
                )}
              </button>
            )}
          </div>

          {/* Status change */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Change Application Status
            </label>
            <div className="relative">
              <select
                value={currentStatus}
                onChange={onChangeStatus}
                disabled={loading}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium
                           px-4 py-2.5 pr-9 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                           transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Updating status…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfilePreview;
