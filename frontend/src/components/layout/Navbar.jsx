import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Bot, Briefcase, FileText } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Hirely</span>
          </Link>{" "}
          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user && user.role === "jobseeker" && (
              <>
                {" "}
                <button
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
                  title="My Applications"
                  onClick={() => navigate("/my-applications")}
                >
                  <FileText className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
                  title="Interview History"
                  onClick={() => navigate("/interview-history")}
                >
                  <Bot className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
                  title="Saved Jobs"
                  onClick={() => navigate("/saved-jobs")}
                >
                  <Bookmark className="h-6 w-6 text-gray-700" />
                </button>
              </>
            )}

            {isAuthenticated ? (
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""}
                userRole={user?.role || ""}
                onLogout={logout}
              />
            ) : (
              <>
                <a
                  href="/login"
                  className="text-grauy-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
