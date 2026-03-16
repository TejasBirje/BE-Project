// import React, { useState } from 'react'
// import { motion } from 'framer-motion'
// import { Mail, Lock, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from "lucide-react";
// import { validateEmail, validatePassword } from '../../utils/helper';
// import axiosInstance from '../../utils/axiosInstance';
// import { API_PATHS } from '../../utils/apiPaths';
// import { useAuth } from '../../context/AuthContext';

// const Login = () => {

//   const { login } = useAuth();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     rememberMe: "",
//   });

//   const [formState, setFormState] = useState({
//     loading: false,
//     errors: {},
//     showPassword: false,
//     success: false,
//   })

//   // Handle input

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev, [name]: value
//     }));

//     // clear error when user starts typing
//     if (formState.errors[name]) {
//       setFormState(prev => ({
//         ...prev, errors: { ...prev.errors, [name]: "" }
//       }))
//     }
//   }

//   const validateForm = () => {
//     const errors = {
//       email: validateEmail(formData.email),
//       password: validatePassword(formData.password),
//     }

//     // remove empty errors
//     Object.keys(errors).forEach(key => {
//       if (!errors[key]) delete errors[key];
//     })

//     setFormState(prev => ({ ...prev, errors }));
//     return Object.keys(errors).length === 0;
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setFormState(prev => ({ ...prev, loading: true }));

//     try {
//       const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
//         email: formData.email,
//         password: formData.password,
//       });

//       const { token, role } = response.data;

//       // Save user in context
//       login(response.data, token);

//       // Update UI state
//       setFormState(prev => ({
//         ...prev,
//         loading: false,
//         success: true,
//         errors: {},
//       }));

//       // Redirect based on role
//       setTimeout(() => {
//         const redirectPath =
//           role === "employer" ? "/employer-dashboard" : "/find-jobs";
//         window.location.href = redirectPath;
//       }, 1500);

//     } catch (error) {
//       setFormState(prev => ({
//         ...prev,
//         loading: false,
//         errors: {
//           submit:
//             error.response?.data?.message ||
//             "Login Failed. Please check your credentials.",
//         },
//       }));
//     }
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   if (!validateForm()) return;

//   //   setFormState(prev => ({ ...prev, loading: true }));

//   //   try {
//   //     const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
//   //       email: formData.email,
//   //       password: formData.password,
//   //       rememberMe: formData.rememberMe
//   //     });

//   //     setFormData(prev => ({
//   //       ...prev,
//   //       loading: false,
//   //       success: true,
//   //       errors: {},
//   //     }))

//   //     if(token) {
//   //       login(response.data, token);

//   //       // Redirect based on role
//   //       setTimeout(() => {
//   //         window.location.href = role === 'employer' ? "/employer-dashboard" : "/find-jobs";
//   //       }, 2000);

//   //       // Redirect based on user role
//   //       setTimeout(() => {
//   //         const redirectPath = User.role === 'employer' ? "/employer-dashboard" : "/find-jobs";

//   //         window.location.href = redirectPath;
//   //       }, 1500);
//   //     }

//   //   } catch (error) {
//   //     setFormState(prev => ({
//   //       ...prev,
//   //       loading: false,
//   //       errors: {
//   //         submit: error.response?.data.message || "Login Failed. Please check your credentials."
//   //       }
//   //     }))
//   //   }
//   // }

//   if (formState.success) {
//     return (
//       <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className='bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center'
//         >
//           <CheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4' />
//           <h2 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
//           <p className='text-gray-600 mb-4'>
//             You have been successfully logged in.
//           </p>
//           <div className='animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto' />
//           <p className='text-sm text-gray-500 mt-2'>Redirecting to your dashboard...</p>
//         </motion.div>
//       </div>
//     )
//   }

//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className='bg-white p-8 rounded-xl shadow-lg max-w-md w-full'
//       >
//         <div className='text-center mb-8'>
//           <h2 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
//           <p className='text-gray-600'>Sign in to your account</p>
//         </div>

//         <form onSubmit={handleSubmit} className='space-y-6'>
//           {/* Email */}
//           <div>
//             <label className='block text-sm font-medium text-gray-700'>Email Address</label>
//             <div className='relative'>
//               <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
//               <input
//                 type="email"
//                 name='email'
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className={`w-full pl-10 pr-4 py-3 rounded-lg border ${formState.errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
//                 placeholder='Enter your email'
//               />
//             </div>
//             {formState.errors.email && (
//               <p className='text-red-500 text-sm mt-1 flex items-center'>
//                 <AlertCircle className='w-4 h-4 mr-1' />
//                 {formState.errors.email}
//               </p>
//             )}
//           </div>

//           {/* Password */}
//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-2'>
//               Password
//             </label>
//             <div className='relative'>
//               <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
//               <input
//                 type={formState.showPassword ? 'text' : 'password'}
//                 name='password'
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className={`w-full pl-10 pr-12 py-3 rounded-lg border ${formState.errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
//                 placeholder='Enter your password'
//               />
//               <button
//                 type='button'
//                 onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
//                 className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:gray-600'
//               >
//                 {formState.showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
//               </button>
//             </div>

//             {formState.errors.password && (
//               <p className='text-red-500 text-sm mt-1 flex items-center'>
//                 <AlertCircle className='w-4 h-4 mr-1' />
//                 {formState.errors.password}
//               </p>
//             )}
//           </div>

//           {/* Submit Error */}
//           {formState.errors.submit && (
//             <div className='bg-red-50 border-red-200 rounded-lg p-3'>
//               <p className='text-red-700 text-sm flex items-center'>
//                 <AlertCircle className='w-4 h-4 mr-2' />
//                 {formState.errors.submit}
//               </p>
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type='submit'
//             disabled={formState.loading}
//             className='w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
//           >
//             {formState.loading ? (
//               <>
//                 <Loader className='w-5 h-5 animate-spin' />
//                 <span>Signing In...</span>
//               </>
//             ) : (
//               <span>Sign In</span>
//             )}
//           </button>

//           {/* Sign Up Link */}
//           <div className='text-center'>
//             <p className='text-gray-600'>
//               Don't have an account?{' '}
//               <a href='/signup' className='text-blue-600 hover:text-blue-700 font-medium'>Create account</a>
//             </p>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   )
// }

// export default Login

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { validateEmail, validatePassword } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

/* ── Reusable field error ── */
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  ) : null;

const Login = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: "",
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };
    Object.keys(errors).forEach((k) => {
      if (!errors[k]) delete errors[k];
    });
    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });
      const { token, role } = response.data;
      login(response.data, token);
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));
      setTimeout(() => {
        window.location.href =
          role === "employer" ? "/employer-dashboard" : "/find-jobs";
      }, 1500);
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            "Login failed. Please check your credentials.",
        },
      }));
    }
  };

  /* ── Success screen ── */
  if (formState.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            You've been successfully signed in to Hirely.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
            Redirecting to your dashboard…
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col justify-between p-10 relative overflow-hidden">
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Blob accents */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white/20 group-hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Hirely
          </span>
        </Link>

        {/* Centre copy */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            AI-Powered Hiring Platform
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Good to see you
            <br />
            back on Hirely
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
            Sign in to manage your jobs, track applications, and connect with
            the right talent or opportunities.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {[
              "AI-powered job matching",
              "Real-time applicant tracking",
              "One-click apply for candidates",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-blue-100">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-300">
          © {new Date().getFullYear()} Hirely · Made with ❤️ by MAST
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Hirely</span>
          </Link>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to Hirely
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back — enter your details below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Email ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none
                             focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all
                             placeholder:text-slate-400 text-slate-800
                             ${formState.errors.email ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-blue-400"}`}
                />
              </div>
              <FieldError msg={formState.errors.email} />
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={formState.showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none
                             focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all
                             placeholder:text-slate-400 text-slate-800
                             ${formState.errors.password ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-blue-400"}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      showPassword: !prev.showPassword,
                    }))
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {formState.showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <FieldError msg={formState.errors.password} />
            </div>

            {/* ── Submit error ── */}
            {formState.errors.submit && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  {formState.errors.submit}
                </p>
              </div>
            )}

            {/* ── Submit button ── */}
            <button
              type="submit"
              disabled={formState.loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 text-sm font-semibold text-white
                         bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200
                         shadow-sm shadow-blue-200 hover:shadow-md active:scale-[0.99]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-1"
            >
              {formState.loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Signing In…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* ── Sign up link ── */}
            <p className="text-center text-sm text-slate-500 pt-1">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Create account
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
