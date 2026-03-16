// import React, { useState, useEffect } from 'react'
// import { useAuth } from '../../context/AuthContext'
// import DashboardLayout from '../../components/layout/DashboardLayout'
// import { Building2, Edit3, Mail } from 'lucide-react'
// import amazonLogo from "../../assets/Amazon logo.png"
// import uploadImage from '../../utils/uploadImage'
// import axiosInstance from '../../utils/axiosInstance'
// import { API_PATHS } from '../../utils/apiPaths'
// import toast from 'react-hot-toast'
// import EditProfileDetails from './EditProfileDetails'

// const EmployerProfilePage = () => {
//   const { user, updateUser } = useAuth()

//   const [profileData, setProfileData] = useState({
//     name: "",
//     email: "",
//     avatar: "",
//     companyName: "",
//     companyDescription: "",
//     companyLogo: "",
//   })

//   const [editMode, setEditMode] = useState(false)
//   const [formData, setFormData] = useState({ ...profileData })
//   const [uploading, setUploading] = useState({ avatar: false, logo: false })
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     if (user) {
//       const data = {
//         name: user.name || "",
//         email: user.email || "",
//         avatar: user.avatar || "",
//         companyName: user.companyName || "",
//         companyDescription: user.companyDescription || "",
//         companyLogo: user.companyLogo || "",
//       }

//       setProfileData(data)
//       setFormData(data)
//     }
//   }, [user])

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   const handleImageUpload = async (file, type) => {
//     setUploading((prev) => ({ ...prev, [type]: true }))

//     try {
//       const imgUploadRes = await uploadImage(file)
//       const imageUrl = imgUploadRes.imageUrl || ""

//       const field = type === "avatar" ? "avatar" : "companyLogo"
//       handleInputChange(field, imageUrl)
//     } catch (error) {
//       console.log("Image upload failed: ", error)
//     } finally {
//       setUploading((prev) => ({ ...prev, [type]: false }))
//     }
//   }

//   const handleImageChange = (e, type) => {
//     const file = e.target.files[0]

//     if (file) {
//       const previewUrl = URL.createObjectURL(file)
//       const field = type === "avatar" ? "avatar" : "companyLogo"
//       handleInputChange(field, previewUrl)

//       handleImageUpload(file, type)
//     }
//   }

//   const handleSave = async () => {
//     setSaving(true)

//     try {
//       const response = await axiosInstance.put(
//         API_PATHS.AUTH.UPDATE_PROFILE,
//         formData
//       )

//       if (response.status === 200) {
//         toast.success("Profile Details Updated Successfully")

//         setProfileData({ ...formData })
//         updateUser({ ...formData })
//         setEditMode(false)
//       }
//     } catch (error) {
//       console.log("Profile update failed: ", error)
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleCancel = () => {
//     setFormData({ ...profileData })
//     setEditMode(false)
//   }

//   if (editMode) {
//     return (
//       <EditProfileDetails
//         formData={formData}
//         handleImageChange={handleImageChange}
//         handleInputChange={handleInputChange}
//         handleSave={handleSave}
//         handleCancel={handleCancel}
//         saving={saving}
//         uploading={uploading}
//       />
//     )
//   }

//   return (
//     <DashboardLayout activeMenu={"company-profile"}>
//       <div className="min-h-screen bg-gray-50 py-10 px-4">
//         <div className="max-w-5xl mx-auto">

//           {/* Header */}
//           <div className="bg-linear-to-r from-blue-500 to-blue-600 px-8 py-6 flex justify-between items-center rounded-t-2xl shadow-md">
//             <h1 className="text-xl font-semibold text-white">
//               Employer Profile
//             </h1>

//             <button
//               className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
//               onClick={() => setEditMode(true)}
//             >
//               <Edit3 className="w-4 h-4" />
//               <span>Edit Profile</span>
//             </button>
//           </div>

//           {/* Content Card */}
//           <div className="bg-white p-10 rounded-b-2xl shadow-md">

//             {/* Top Grid Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

//               {/* Personal Information */}
//               <div className="space-y-6">
//                 <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">
//                   Personal Information
//                 </h2>

//                 <div className="flex items-center space-x-5">
//                   <img
//                     src={profileData.avatar || "/default-avatar.png"}
//                     alt="Avatar"
//                     className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-sm"
//                   />

//                   <div>
//                     <h3 className="text-xl font-semibold text-gray-800">
//                       {profileData.name || "No Name"}
//                     </h3>

//                     <div className="flex items-center text-sm text-gray-600 mt-2">
//                       <Mail className="w-4 h-4 mr-2" />
//                       <span>{profileData.email || "No Email"}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Company Information */}
//               <div className="space-y-6">
//                 <h2 className="text-lg font-semibold text-gray-800 border-b pb-3">
//                   Company Information
//                 </h2>

//                 <div className="flex items-center space-x-5">
//                   <img
//                     src={profileData.companyLogo || amazonLogo}
//                     alt="Company Logo"
//                     className="w-24 h-24 rounded-xl object-contain bg-white p-2 border-4 border-blue-100 shadow-sm"
//                   />

//                   <div>
//                     <h3 className="text-xl font-semibold text-gray-800">
//                       {profileData.companyName || "No Company Name"}
//                     </h3>

//                     <div className="flex items-center text-sm text-gray-600 mt-2">
//                       <Building2 className="w-4 h-4 mr-2" />
//                       <span>Company Profile</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Full Width About Company */}
//             {profileData.companyDescription && (
//               <div className="mt-12 border-t pt-8">
//                 <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                   About Company
//                 </h2>

//                 <p className="text-gray-600 text-sm leading-relaxed max-w-4xl">
//                   {profileData.companyDescription}
//                 </p>
//               </div>
//             )}

//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   )
// }

// export default EmployerProfilePage

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Building2, Edit3, Mail, User, FileText } from "lucide-react";
import amazonLogo from "../../assets/Amazon logo.png";
import uploadImage from "../../utils/uploadImage";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import EditProfileDetails from "./EditProfileDetails";

/* ── Avatar initials fallback ── */
const gradients = [
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-pink-400 to-rose-500",
];
const getGradient = (name = "") =>
  gradients[(name.charCodeAt(0) || 0) % gradients.length];
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const EmployerProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
    companyName: "",
    companyDescription: "",
    companyLogo: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [uploading, setUploading] = useState({ avatar: false, logo: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        companyLogo: user.companyLogo || "",
      };
      setProfileData(data);
      setFormData(data);
    }
  }, [user]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = async (file, type) => {
    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const imgUploadRes = await uploadImage(file);
      const imageUrl = imgUploadRes.imageUrl || "";
      handleInputChange(type === "avatar" ? "avatar" : "companyLogo", imageUrl);
    } catch (error) {
      console.log("Image upload failed:", error);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange(
        type === "avatar" ? "avatar" : "companyLogo",
        URL.createObjectURL(file),
      );
      handleImageUpload(file, type);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData,
      );
      if (response.status === 200) {
        toast.success("Profile updated successfully");
        setProfileData({ ...formData });
        updateUser({ ...formData });
        setEditMode(false);
      }
    } catch (error) {
      console.log("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setEditMode(false);
  };

  if (editMode) {
    return (
      <EditProfileDetails
        formData={formData}
        handleImageChange={handleImageChange}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        saving={saving}
        uploading={uploading}
      />
    );
  }

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-3xl mx-auto pb-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Company Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Your employer profile visible to candidates
            </p>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white
                       px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50
                       transition-all duration-200 shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* ── Personal Info card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          {/* Card header accent */}
          <div className="h-[3px] bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Personal Information
            </p>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(profileData.name)} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <span className="text-white text-lg font-bold">
                    {getInitials(profileData.name)}
                  </span>
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {profileData.name || (
                    <span className="text-slate-400 font-normal">
                      No name set
                    </span>
                  )}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  {profileData.email || "No email"}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <User className="w-3 h-3 flex-shrink-0" />
                  Employer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Company Info card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="h-[3px] bg-gradient-to-r from-indigo-500 to-violet-600" />
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Company Information
            </p>
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {profileData.companyLogo ? (
                <img
                  src={profileData.companyLogo}
                  alt="Company Logo"
                  className="w-16 h-16 rounded-2xl object-contain bg-slate-50 border border-slate-100 p-1.5 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {profileData.companyName || (
                    <span className="text-slate-400 font-normal">
                      No company name
                    </span>
                  )}
                </h3>
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  Company Profile
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── About Company card ── */}
        {profileData.companyDescription && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  About the Company
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {profileData.companyDescription}
              </p>
            </div>
          </div>
        )}

        {/* Empty about state */}
        {!profileData.companyDescription && (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              No company description yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add one by clicking Edit Profile
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfilePage;
