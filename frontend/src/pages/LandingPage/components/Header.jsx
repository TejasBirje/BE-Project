import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    {
      label: "Find Jobs",
      action: () => {
        navigate("/find-jobs");
        setMobileOpen(false);
      },
    },
    {
      label: "For Employers",
      action: () => {
        navigate(
          isAuthenticated && user?.role === "employer"
            ? "/employer-dashboard"
            : "/login",
        );
        setMobileOpen(false);
      },
    },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/98 backdrop-blur-md shadow-sm border-b border-slate-100"
            : "bg-white/90 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            {/* Logo — flex-1 so it takes equal width to auth section */}
            <div className="flex-1 flex items-center">
              <div
                className="flex items-center space-x-2.5 cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  Hirely
                </span>
              </div>
            </div>

            {/* Desktop Nav — true center */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop Auth — flex-1 + justify-end mirrors logo width on the left */}
            <div className="flex-1 hidden md:flex items-center justify-end space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600 font-medium">
                    Hi, <span className="text-slate-900">{user?.name}</span>
                  </span>
                  <a
                    href={
                      user?.role === "employer"
                        ? "/employer-dashboard"
                        : "/find-jobs"
                    }
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm px-5 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md shadow-blue-200"
                  >
                    Dashboard
                  </a>
                </div>
              ) : (
                <>
                  <a
                    href="/login"
                    className="text-sm text-slate-500 hover:text-slate-900 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    className="bg-linear-to-r from-blue-600 to-indigo-700 text-white text-sm px-5 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md shadow-blue-200"
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-16 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden md:hidden"
            >
              <div className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className="w-full text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </button>
                ))}

                <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 px-4">
                        Logged in as{" "}
                        <span className="font-semibold text-slate-700">
                          {user?.name}
                        </span>
                      </p>
                      <a
                        href={
                          user?.role === "employer"
                            ? "/employer-dashboard"
                            : "/find-jobs"
                        }
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm px-5 py-3 rounded-xl font-semibold"
                      >
                        Dashboard
                      </a>
                    </div>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="block w-full text-center text-slate-700 border border-slate-200 text-sm px-5 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                      >
                        Login
                      </a>
                      <a
                        href="/signup"
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm px-5 py-3 rounded-xl font-semibold"
                      >
                        Sign Up
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
