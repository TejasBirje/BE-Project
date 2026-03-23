import { MapPin, Search } from 'lucide-react'
import React from 'react'

const SearchHeader = ({ filters, handleFilterChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col gap-4">

        {/* Heading */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight tracking-tight">
            Find Your Dream Job
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover opportunities that match your passion
          </p>
        </div>

        {/* Search inputs */}
        <div className="flex flex-col sm:flex-row gap-2.5">

          {/* Keyword input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Job title, company, or keywords"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-800"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
            />
          </div>

          {/* Location input */}
          <div className="relative sm:w-52">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Location"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-800"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>

          {/* Search button */}
          <button className="sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 whitespace-nowrap">
            Search Jobs
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchHeader