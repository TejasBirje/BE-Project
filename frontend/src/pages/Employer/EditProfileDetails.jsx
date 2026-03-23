import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Save, X, Camera, User, Mail, Building2, FileText } from "lucide-react";
import amazonLogo from "../../assets/Amazon logo.png";

const EditProfileDetails = ({
  formData,
  handleImageChange,
  handleInputChange,
  handleSave,
  handleCancel,
  saving,
  uploading,
}) => {
  if (!formData) return null;

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-3xl mx-auto pb-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Edit Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Update your personal and company details
            </p>
          </div>
        </div>

        {/* ── Personal Info card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
          <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">
                Personal Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="relative group/av flex-shrink-0">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  {/* Upload overlay */}
                  <label className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer">
                    {uploading.avatar ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "avatar")}
                      className="hidden"
                      disabled={uploading.avatar}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Profile Photo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hover to change · PNG or JPG
                  </p>
                </div>
              </div>

              {/* Full Name */}
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

              {/* Email (disabled) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input
                    type="text"
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
        </div>

        {/* ── Company Info card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="h-[3px] bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">
                Company Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Company Logo upload */}
              <div className="flex items-center gap-4">
                <div className="relative group/logo flex-shrink-0">
                  {formData.companyLogo ? (
                    <img
                      src={formData.companyLogo || amazonLogo}
                      alt="Company Logo"
                      className="w-16 h-16 rounded-2xl object-contain bg-slate-50 border border-slate-100 p-1.5"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <label className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer">
                    {uploading.logo ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "logo")}
                      className="hidden"
                      disabled={uploading.logo}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Company Logo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hover to change · PNG or JPG
                  </p>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white
                               transition-all placeholder:text-slate-400 text-slate-800"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Company Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <textarea
                    value={formData.companyDescription}
                    onChange={(e) =>
                      handleInputChange("companyDescription", e.target.value)
                    }
                    rows={4}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white
                               transition-all placeholder:text-slate-400 text-slate-800 resize-none"
                    placeholder="Describe your company, culture, and what makes it a great place to work…"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200
                       rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving || uploading.avatar || uploading.logo}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700
                       rounded-xl transition-all duration-200 shadow-sm shadow-blue-200 hover:shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.99]"
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
    </DashboardLayout>
  );
};

export default EditProfileDetails;
