// import React from 'react'
// import { useState, useEffect } from "react";
// import { Briefcase, Building2, LogOut, Menu, X } from 'lucide-react';
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { NAVIGATION_MENU } from "../../utils/data"
// import ProfileDropdown from './ProfileDropdown';

// const NavigationItem = ({ item, isActive, onClick, isCollapsed }) => {
//     const Icon = item.icon;

//     return <button
//         onClick={() => onClick(item.id)}
//         className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
//             ${isActive ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-50"

//                 : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//             }
//             `}
//     >
//         <Icon
//             className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"}`}
//         />
//         {!isCollapsed && <span className='ml-3 truncate'>{item.name}</span>}
//     </button>
// }

// const DashboardLayout = ({ activeMenu, children }) => {
//     const { user, logout } = useAuth();

//     const navigate = useNavigate();

//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
//     const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//     const [isMobile, setIsMobile] = useState(false);

//     useEffect(() => {
//         const handleResize = () => {
//             const mobile = window.innerWidth < 768;
//             setIsMobile(mobile);
//             if (!mobile) {
//                 setSidebarOpen(false);
//             }
//         }

//         handleResize();
//         window.addEventListener("resize", handleResize);

//         return () => {
//             window.removeEventListener("resize", handleResize);
//         }
//     }, []);

//     useEffect(() => {
//         const handleClickOutside = () => {
//             if (profileDropdownOpen) {
//                 setProfileDropdownOpen(false);
//             }
//         }

//         document.addEventListener("click", handleClickOutside);
//         return () => document.removeEventListener("click", handleClickOutside);
//     }, [profileDropdownOpen]);

//     const handleNavigation = (itemId) => {
//         setActiveNavItem(itemId);
//         navigate(`/${itemId}`);
//         if (isMobile) {
//             setSidebarOpen(false);
//         }
//     }

//     const toggleSidebar = () => {
//         setSidebarOpen(!sidebarOpen);
//     }

//     const sidebarCollapsed = !isMobile && false;

//     return (
//         <div className='flex h-screen bg-gray-50'>

//             {/* Sidebar */}
//             <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${isMobile ? sidebarOpen ? "translate-x-0" : "-translate-x-full" : "translate-x-0"} ${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200`}>
//                 {/* Company Logo */}
//                 <div className='flex items-center h-16 border-b border-gray-200 pl-6'>
//                     {!sidebarCollapsed ? (
//                         <Link className='flex items-center space-x-3' to={"/"}>
//                             <div className='h-8 w-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
//                                 <Briefcase className='h-5 w-5 text-white' />
//                             </div>
//                             <span className='text-gray-900 font-bold text-xl'>Hirely</span>
//                         </Link>
//                     ) : (
//                         <div className='h-8 w-8 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center'>
//                             <Building2 className='h-5 w-5 text-white' />
//                         </div>
//                     )}
//                 </div>

//                 {/* Navigation */}

//                 <nav className='p-3 space-y-2'>
//                     {NAVIGATION_MENU.map((item) => (
//                         <NavigationItem
//                             key={item.id}
//                             item={item}
//                             isActive={activeNavItem === item.id}
//                             onClick={handleNavigation}
//                             isCollapsed={sidebarCollapsed}
//                         />
//                     ))}
//                 </nav>

//                 {/* Logout */}
//                 <div className='absolute bottom-4 left-4 right-4'>
//                     <button className='w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200' onClick={logout}>
//                         <LogOut className='w-5 h-5 shrink-0 text-gray-700' />
//                         {!sidebarCollapsed && <span className='ml-3'>Logout</span>}
//                     </button>
//                 </div>
//             </div>

//             {/* Mobile overlay */}
//             {isMobile && sidebarOpen && (
//                 <div
//                     className='fixed inset-0 bg-black bg-capacity-25 z-40 backdrop-blur-sm'
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             {/* Main Content */}
//             <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"}`}>
//                 {/* Top Navbar */}
//                 <header className='bg-white/80 backdrop-blue-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30'>
//                     <div className='flex items-center space-x-4'>
//                         {isMobile && (
//                             <button
//                                 onClick={toggleSidebar}
//                                 className='p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200'
//                             >
//                                 {sidebarOpen ? (
//                                     <X className='w-5 h-5 text-gray-600'/>
//                                 ) : (
//                                     <Menu className='h-5 w-5 text-gray-600'/>
//                                 )}
//                             </button>
//                         )}
//                         <div>
//                             <h1 className='text-base font-semibold text-gray-900'>
//                                 Welcome back!
//                             </h1>
//                             <p className='text-sm text-gray-500 hidden sm:block'>
//                                 Here's what's happening with your jobs today.
//                             </p>
//                         </div>
//                     </div>

//                     <div className='flex items-center space-x-3'>
//                         {/* Profile Dropdown */}
//                         <ProfileDropdown
//                             isOpen={profileDropdownOpen}
//                             onToggle={(e) => {
//                                 e.stopPropagation();
//                                 setProfileDropdownOpen(!profileDropdownOpen);
//                             }}

//                             avatar={user?.avatar || ""}
//                             companyName={user?.name || ""}
//                             email={user?.email || ""}
//                             onLogout={logout}
//                         />
//                     </div>
//                 </header>

//                 {/* Main Content area */}
//                 <main className='flex-l overflow-auto p-6'>
//                         {children}
//                 </main>
//             </div>
//         </div>
//     )
// }

// export default DashboardLayout

import React, { useState, useEffect } from "react";
import { Briefcase, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NAVIGATION_MENU } from "../../utils/data";
import ProfileDropdown from "./ProfileDropdown";

const NavigationItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group
        ${
          isActive
            ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
        }`}
    >
      <Icon
        className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
      />
      <span className="truncate">{item.name}</span>
    </button>
  );
};

const DashboardLayout = ({ activeMenu, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) setProfileDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    navigate(`/${itemId}`);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-300
        ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-5 border-b border-slate-100 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Hirely
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAVIGATION_MENU.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-slate-100">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-100"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-500 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isMobile ? "ml-0" : "ml-64"}`}
      >
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}
            <div>
              <h1 className="text-sm font-semibold text-slate-900">
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Here's what's happening with your jobs today.
              </p>
            </div>
          </div>

          <ProfileDropdown
            isOpen={profileDropdownOpen}
            onToggle={(e) => {
              e.stopPropagation();
              setProfileDropdownOpen(!profileDropdownOpen);
            }}
            avatar={user?.avatar || ""}
            companyName={user?.name || ""}
            email={user?.email || ""}
            onLogout={logout}
          />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
      {/* ── Logout confirmation modal ── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>

            {/* Text */}
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Log out of Hirely?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to log out? You'll need to sign in again to
              access your dashboard.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm shadow-red-200"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
