// import { ChevronDown, ChevronUp } from "lucide-react";
// import React from "react";
// import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
// import SalaryRangeSlider from "../../../components/SalaryRangeSlider";

// const FilterSection = ({ title, children, isExpanded, onToggle }) => {
//   return (
//     <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
//       <button
//         onClick={onToggle}
//         className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors"
//       >
//         {title}
//         {isExpanded ? (
//           <ChevronUp className="w-4 h-4" />
//         ) : (
//           <ChevronDown className="w-4 h-4" />
//         )}
//       </button>

//       {isExpanded && children}
//     </div>
//   );
// };

// const FilterContent = ({
//   toggleSection,
//   clearAllFilters,
//   expandedSections,
//   filters,
//   handleFilterChange,
// }) => {
//   return (
//     <>
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={clearAllFilters}
//           className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
//         >
//           Clear All
//         </button>
//       </div>

//       {/* Job Type */}
//       <FilterSection
//         title="Job Type"
//         isExpanded={expandedSections?.jobType}
//         onToggle={() => toggleSection("jobType")}
//       >
//         <div className="space-y-3">
//           {JOB_TYPES.map((type) => (
//             <label key={type.value} className="flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//                 checked={filters?.type === type.value}
//                 onChange={(e) =>
//                   handleFilterChange(
//                     "type",
//                     e.target.checked ? type.value : ""
//                   )
//                 }
//               />
//               <span className="ml-3 text-gray-700 font-medium">
//                 {type.value}
//               </span>
//             </label>
//           ))}
//         </div>
//       </FilterSection>

//       {/* Salary */}
//       <FilterSection
//         title="Salary Range"
//         isExpanded={expandedSections?.salary}
//         onToggle={() => toggleSection("salary")}
//       >
//         <SalaryRangeSlider
//           filters={filters}
//           handleFilterChange={handleFilterChange}
//         />
//       </FilterSection>

//       {/* Category */}
//       <FilterSection
//         title="Category"
//         isExpanded={expandedSections?.categories}
//         onToggle={() => toggleSection("categories")}
//       >
//         <div className="space-y-3">
//           {CATEGORIES.map((type) => (
//             <label key={type.value} className="flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
//                 checked={filters?.category === type.value}
//                 onChange={(e) =>
//                   handleFilterChange(
//                     "category",
//                     e.target.checked ? type.value : ""
//                   )
//                 }
//               />
//               <span className="ml-3 text-gray-700 font-medium">
//                 {type.value}
//               </span>
//             </label>
//           ))}
//         </div>
//       </FilterSection>
//     </>
//   );
// };

// export default FilterContent;

import { ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import SalaryRangeSlider from "../../../components/SalaryRangeSlider";

const FilterSection = ({ title, children, isExpanded, onToggle }) => {
  return (
    <div className="border-b border-slate-100 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left mb-0 group"
      >
        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
          {title}
        </span>
        <span className="p-0.5 rounded-md text-slate-400 group-hover:text-blue-500 transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  );
};

const FilterContent = ({
  toggleSection,
  clearAllFilters,
  expandedSections,
  filters,
  handleFilterChange,
}) => {
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      {/* Clear All row */}
      {activeCount > 0 && (
        <div className="flex items-center justify-between mb-4 py-2 px-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-xs text-blue-700 font-medium">
            {activeCount} filter{activeCount > 1 ? 's' : ''} active
          </span>
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        </div>
      )}

      {/* Job Type */}
      <FilterSection
        title="Job Type"
        isExpanded={expandedSections?.jobType}
        onToggle={() => toggleSection("jobType")}
      >
        <div className="space-y-1">
          {JOB_TYPES.map((type) => {
            const isChecked = filters?.type === type.value;
            return (
              <label
                key={type.value}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isChecked
                    ? "bg-blue-50 border border-blue-100"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  isChecked
                    ? "bg-blue-600 border-blue-600"
                    : "border-slate-300 bg-white"
                }`}>
                  {isChecked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={(e) =>
                      handleFilterChange("type", e.target.checked ? type.value : "")
                    }
                  />
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  isChecked ? "text-blue-700" : "text-slate-600"
                }`}>
                  {type.value}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Salary Range */}
      <FilterSection
        title="Salary Range"
        isExpanded={expandedSections?.salary}
        onToggle={() => toggleSection("salary")}
      >
        <SalaryRangeSlider
          filters={filters}
          handleFilterChange={handleFilterChange}
        />
      </FilterSection>

      {/* Category */}
      <FilterSection
        title="Category"
        isExpanded={expandedSections?.categories}
        onToggle={() => toggleSection("categories")}
      >
        <div className="space-y-1">
          {CATEGORIES.map((type) => {
            const isChecked = filters?.category === type.value;
            return (
              <label
                key={type.value}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isChecked
                    ? "bg-blue-50 border border-blue-100"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  isChecked
                    ? "bg-blue-600 border-blue-600"
                    : "border-slate-300 bg-white"
                }`}>
                  {isChecked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.checked ? type.value : "")
                    }
                  />
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  isChecked ? "text-blue-700" : "text-slate-600"
                }`}>
                  {type.value}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>
    </>
  );
};

export default FilterContent;