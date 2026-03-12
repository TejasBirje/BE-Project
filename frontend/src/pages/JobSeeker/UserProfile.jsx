import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import uploadImage from "../../utils/uploadImage";
import Navbar from "../../components/layout/Navbar";
import { Save, Trash2, X, FileText } from "lucide-react";
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

  // ── Avatar upload (unchanged — uses uploadImage util) ──
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

  // ── Resume upload — calls POST /api/user/upload-resume (multipart) ──
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
        }
      );

      // Backend returns { resumeId, fileUrl, filename }
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

  // ── Save profile (name + avatar only; resume is saved immediately on upload) ──
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

  // ── Delete resume ──
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

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="pt-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h1 className="text-2xl font-semibold text-white">
                Profile Settings
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Update your personal details
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={formData.avatar || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-md"
                  />
                  {uploading.avatar && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">
                    Change Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="mt-2 inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                    Upload Image
                  </div>
                </label>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {/* Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume (PDF)
                </label>

                {formData.resume ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <a
                      href={formData.resume}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-green-700 underline truncate flex-1"
                    >
                      {formData.resume.split("/").pop() || "View Resume"}
                    </a>
                    <button
                      onClick={handleDeleteResume}
                      disabled={saving}
                      className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <FileText className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        {uploading.resume
                          ? "Uploading..."
                          : "Click to upload PDF resume"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleResumeChange}
                        className="hidden"
                        disabled={uploading.resume}
                      />
                    </label>
                    {uploading.resume && (
                      <p className="text-xs text-blue-500 mt-1 text-center">
                        Uploading resume to server...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || uploading.avatar || uploading.resume}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
