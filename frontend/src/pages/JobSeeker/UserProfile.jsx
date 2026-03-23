import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadImage from "../../utils/uploadImage";
import Navbar from "../../components/layout/Navbar";
import {
  Save,
  Trash2,
  X,
  FileText,
  Camera,
  User,
  Mail,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    resume: user?.resume || "",
    resumeId: user?.resumeId || null,
  });

  const [formData, setFormData] = useState({ ...profileData });
  const [uploading, setUploading] = useState({ avatar: false, resume: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = {
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      resume: user?.resume || "",
      resumeId: user?.resumeId || null,
    };
    setProfileData(userData);
    setFormData(userData);
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    handleInputChange("avatar", previewUrl);
    setUploading((prev) => ({ ...prev, avatar: true }));
    try {
      const res = await uploadImage(file);
      handleInputChange("avatar", res.imageUrl || previewUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Avatar upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, avatar: false }));
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, resume: true }));
    try {
      const formPayload = new FormData();
      formPayload.append("resume", file);
      const res = await axiosInstance.post(
        API_PATHS.RESUME.UPLOAD,
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const { resumeId, fileUrl } = res.data;
      const updated = { ...formData, resume: fileUrl, resumeId };
      setFormData(updated);
      setProfileData(updated);
      updateUser({ resume: fileUrl, resumeId });
      toast.success("Resume uploaded successfully");
    } catch (err) {
      console.error("Resume upload error:", err);
      toast.error(err?.response?.data?.message || "Resume upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, resume: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name: formData.name,
        avatar: formData.avatar,
      });
      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setProfileData(formData);
        updateUser({ name: formData.name, avatar: formData.avatar });
        navigate("/find-jobs")
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    navigate("/find-jobs");
  };

  const handleDeleteResume = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.delete(API_PATHS.RESUME.DELETE);
      if (response.status === 200) {
        toast.success("Resume deleted successfully");
        const updated = { ...formData, resume: "", resumeId: null };
        setProfileData(updated);
        setFormData(updated);
        updateUser({ resume: "", resumeId: null });
      }
    } catch (error) {
      console.error("Delete Resume Error:", error);
      toast.error("Failed to delete resume");
    } finally {
      setSaving(false);
    }
  };

  /* Initials fallback for avatar */
  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // const hasChanges =
  //   formData.name !== profileData.name ||
  //   formData.avatar !== profileData.avatar; // (removed resume from here since it's saved immediately and not part of this save action)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-14">
        {/* Page title */}
        <div className="mb-6 mt-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Profile Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal details and resume
          </p>
        </div>

        {/* ── Avatar card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
          <div className="flex items-center gap-5">
            {/* Avatar with upload overlay */}
            <div className="relative shrink-0 group/av">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-xl font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}

              {/* Upload overlay on hover */}
              <label className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer">
                {uploading.avatar ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading.avatar}
                />
              </label>
            </div>

            {/* Name + email summary */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-base truncate">
                {formData.name || "Your Name"}
              </p>
              <p className="text-sm text-slate-400 truncate mt-0.5">
                {formData.email}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Hover over the photo to change it
              </p>
            </div>
          </div>
        </div>

        {/* ── Personal info card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">
            Personal Information
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                             focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white
                             transition-all placeholder:text-slate-400 text-slate-800"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email — disabled */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                Email cannot be changed
              </p>
            </div>
          </div>
        </div>

        {/* ── Resume card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Resume
            </h2>
            {formData.resume && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Uploaded
              </span>
            )}
          </div>

          {formData.resume ? (
            /* Existing resume row */
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={formData.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 truncate block"
                >
                  {formData.resume.split("/").pop() || "View Resume"}
                </a>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF · Click to preview
                </p>
              </div>
              <button
                onClick={handleDeleteResume}
                disabled={saving}
                className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Delete resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Upload dropzone */
            <label
              className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                uploading.resume
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {uploading.resume ? (
                <>
                  <span className="w-6 h-6 border-2 border-blue-400/40 border-t-blue-500 rounded-full animate-spin mb-3" />
                  <p className="text-sm font-medium text-blue-600">
                    Uploading resume…
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Please wait</p>
                </>
              ) : (
                <>
                  <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Upload your resume
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF format · Max 5MB
                  </p>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="hidden"
                disabled={uploading.resume}
              />
            </label>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving || uploading.avatar || uploading.resume} // (|| !hasChanges is remove from here since resume changes are saved immediately and not part of this save action)
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700
                       rounded-xl transition-all duration-200 shadow-sm shadow-blue-200 hover:shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
