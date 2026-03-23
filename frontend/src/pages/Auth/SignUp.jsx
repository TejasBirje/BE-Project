import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Camera,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Loader,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  validateAvatar,
  validateEmail,
  validatePassword,
} from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import uploadImage from "../../utils/uploadImage";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

/* ── Reusable field error ── */
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {msg}
    </p>
  ) : null;

const SignUp = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    avatar: "",
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    avatarPreview: null,
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

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (formState.errors.role) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, role: "" },
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateAvatar(file);
    if (error) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, avatar: error },
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormState((prev) => ({
        ...prev,
        avatarPreview: e.target.result,
        errors: { ...prev.errors, avatar: "" },
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = {
      fullName: !formData.fullName ? "Full name is required" : "",
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      role: !formData.role ? "Please select a role to continue" : "",
      avatar: "",
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
      let avatarUrl = "";
      if (formData.avatar) {
        const res = await uploadImage(formData.avatar);
        avatarUrl = res.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        email: formData.email,
        name: formData.fullName,
        password: formData.password,
        role: formData.role,
        avatar: avatarUrl,
      });
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        errors: {},
      }));
      const { token } = response.data;
      if (token) {
        login(response.data, token);
        setTimeout(() => {
          window.location.href =
            formData.role === "employer" ? "/employer-dashboard" : "/find-jobs";
        }, 2000);
      }
    } catch (error) {
      console.log("Error in handleSubmit:", error);
      setFormState((prev) => ({
        ...prev,
        loading: false,
        errors: {
          submit:
            error.response?.data?.message ||
            "Registration failed. Please try again.",
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
            Account Created!
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Welcome to Hirely! You've successfully joined the platform.
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
            Start your journey
            <br />
            with Hirely today
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xs">
            Join over 50,000 professionals and 200+ companies already using
            Hirely to connect talent with opportunity.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[
              { val: "50K+", lbl: "Active Users" },
              { val: "200+", lbl: "Companies" },
              { val: "25K+", lbl: "Jobs Posted" },
              { val: "95%", lbl: "Match Rate" },
            ].map(({ val, lbl }) => (
              <div
                key={lbl}
                className="bg-white/10 border border-white/15 rounded-xl px-4 py-3"
              >
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-xs text-blue-200 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-300">
          © {new Date().getFullYear()} Hirely · Made with ❤️ by MAST
        </p>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Hirely</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Join thousands of professionals on Hirely
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Role selector — first so users set context first ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                I am a <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    role: "jobseeker",
                    Icon: UserCheck,
                    label: "Job Seeker",
                    sub: "Looking for opportunities",
                  },
                  {
                    role: "employer",
                    Icon: Building2,
                    label: "Employer",
                    sub: "Hiring talent",
                  },
                ].map(({ role, Icon, label, sub }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      formData.role === role
                        ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.role === role ? "bg-blue-600" : "bg-slate-100"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${formData.role === role ? "text-white" : "text-slate-500"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-sm font-semibold ${formData.role === role ? "text-blue-700" : "text-slate-700"}`}
                      >
                        {label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              <FieldError msg={formState.errors.role} />
            </div>

            {/* ── Full Name ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none
                             focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all
                             placeholder:text-slate-400 text-slate-800
                             ${formState.errors.fullName ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-blue-400"}`}
                />
              </div>
              <FieldError msg={formState.errors.fullName} />
            </div>

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
                  placeholder="Minimum 8 characters"
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

            {/* ── Avatar ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Profile Photo <span className="text-slate-300">(Optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Preview circle */}
                <div className="relative flex-shrink-0 group/av">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {formState.avatarPreview ? (
                      <img
                        src={formState.avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar"
                    className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="avatar"
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all w-fit"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Photo
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    JPG or PNG · Max 5MB
                  </p>
                </div>

                <input
                  type="file"
                  id="avatar"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <FieldError msg={formState.errors.avatar} />
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
                  Creating Account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* ── Login link ── */}
            <p className="text-center text-sm text-slate-500 pt-1">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in here
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
