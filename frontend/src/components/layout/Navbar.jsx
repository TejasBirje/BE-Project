// import React, { useEffect, useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { Link, useNavigate } from "react-router-dom";
// import { Bookmark, Bot, Briefcase, FileText } from "lucide-react";
// import ProfileDropdown from "./ProfileDropdown";

// const Navbar = () => {
//   const { user, logout, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => {
//       if (profileDropdownOpen) {
//         setProfileDropdownOpen(false);
//       }
//     };

//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [profileDropdownOpen]);

//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
//               <Briefcase className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-lg font-bold text-gray-900">Hirely</span>
//           </Link>{" "}
//           {/* Auth Buttons */}
//           <div className="flex items-center space-x-3">
//             {user && user.role === "jobseeker" && (
//               <>
//                 {" "}
//                 <button
//                   className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
//                   title="My Applications"
//                   onClick={() => navigate("/my-applications")}
//                 >
//                   <FileText className="h-5 w-5 text-gray-700" />
//                 </button>
//                 <button
//                   className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
//                   title="Interview History"
//                   onClick={() => navigate("/interview-history")}
//                 >
//                   <Bot className="h-5 w-5 text-gray-700" />
//                 </button>
//                 <button
//                   className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative"
//                   title="Saved Jobs"
//                   onClick={() => navigate("/saved-jobs")}
//                 >
//                   <Bookmark className="h-6 w-6 text-gray-700" />
//                 </button>
//               </>
//             )}

//             {isAuthenticated ? (
//               <ProfileDropdown
//                 isOpen={profileDropdownOpen}
//                 onToggle={(e) => {
//                   e.stopPropagation();
//                   setProfileDropdownOpen(!profileDropdownOpen);
//                 }}
//                 avatar={user?.avatar || ""}
//                 companyName={user?.name || ""}
//                 email={user?.email || ""}
//                 userRole={user?.role || ""}
//                 onLogout={logout}
//               />
//             ) : (
//               <>
//                 <a
//                   href="/login"
//                   className="text-grauy-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
//                 >
//                   Login
//                 </a>
//                 <a
//                   href="/signup"
//                   className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
//                 >
//                   Sign Up
//                 </a>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Bot, Briefcase, FileText } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";

const NavIconButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
  >
    <Icon className="w-4.5 h-4.5" />
  </button>
);

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) setProfileDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-slate-100'
        : 'bg-white/95 backdrop-blur-sm border-b border-slate-100'
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Hirely</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">

            {/* Jobseeker quick-access icons */}
            {user && user.role === "jobseeker" && (
              <div className="flex items-center gap-0.5 mr-2">
                <NavIconButton
                  icon={FileText}
                  label="My Applications"
                  onClick={() => navigate("/my-applications")}
                />
                <NavIconButton
                  icon={Bot}
                  label="Interview History"
                  onClick={() => navigate("/interview-history")}
                />
                <NavIconButton
                  icon={Bookmark}
                  label="Saved Jobs"
                  onClick={() => navigate("/saved-jobs")}
                />
              </div>
            )}

            {/* Auth state */}
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
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium px-4 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="text-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm shadow-blue-200 hover:shadow-md"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;