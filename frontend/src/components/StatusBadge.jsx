// import React from "react";

// const StatusBadge = ({ status }) => {
//   const statusConfig = {
//     Applied: "bg-gray-100 text-gray-800",
//     "Under Review": "bg-yellow-100 text-yellow-800",
//     Accepted: "bg-green-100 text-green-800",
//     Rejected: "bg-red-100 text-red-800",
//     // Legacy / aliases
//     Interview: "bg-yellow-100 text-yellow-800",
//     Hired: "bg-green-100 text-green-800",
//   };

//   return (
//     <span
//       className={`px-3 py-1 rounded text-sm font-medium ${
//         statusConfig[status] || "bg-gray-100 text-gray-800"
//       }`}
//     >
//       {status}
//     </span>
//   );
// };

// export default StatusBadge;

import React from "react";
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  CalendarCheck,
  UserCheck,
} from "lucide-react";

const statusConfig = {
  Applied: {
    classes: "bg-slate-50 text-slate-600 border border-slate-200",
    icon: Clock,
  },
  "Under Review": {
    classes: "bg-amber-50 text-amber-700 border border-amber-100",
    icon: Eye,
  },
  Interview: {
    classes: "bg-blue-50 text-blue-700 border border-blue-100",
    icon: CalendarCheck,
  },
  Accepted: {
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    icon: CheckCircle,
  },
  Hired: {
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    icon: UserCheck,
  },
  Rejected: {
    classes: "bg-red-50 text-red-600 border border-red-100",
    icon: XCircle,
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    classes: "bg-slate-50 text-slate-600 border border-slate-200",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${config.classes}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default StatusBadge;
