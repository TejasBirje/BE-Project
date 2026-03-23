import React, { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  Users,
  Building2,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import JobDashboardCard from "../../components/cards/JobDashboardCard";
import ApplicantDashboardCard from "../../components/cards/ApplicantDashboardCard";

/* ── Reusable section card ── */
const Card = ({ title, subtitle, headerAction, className = "", children }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
  >
    {(title || headerAction) && (
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerAction}
      </div>
    )}
    <div className={title ? "px-5 pb-5" : "p-5"}>{children}</div>
  </div>
);

/* ── Stat card ── */
const colorMap = {
  blue: {
    bg: "bg-blue-600",
    light: "bg-blue-50",
    text: "text-blue-600",
    ring: "bg-blue-500/20",
  },
  green: {
    bg: "bg-emerald-600",
    light: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "bg-emerald-500/20",
  },
  purple: {
    bg: "bg-violet-600",
    light: "bg-violet-50",
    text: "text-violet-600",
    ring: "bg-violet-500/20",
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
}) => {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 ${c.light} rounded-xl flex items-center justify-center`}
        >
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-500">{title}</p>
    </div>
  );
};

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardOverview = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
      if (response.status === 200) setDashboardData(response.data);
    } catch (error) {
      console.log("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverview();
    return () => {};
  }, []);

  const quickActions = [
    {
      title: "Post New Job",
      icon: Plus,
      color: "bg-blue-50 text-blue-700 border-blue-100",
      path: "/post-job",
    },
    {
      title: "Review Applications",
      icon: Users,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      path: "/manage-jobs",
    },
    {
      title: "Company Settings",
      icon: Building2,
      color: "bg-amber-50 text-amber-700 border-amber-100",
      path: "/company-profile",
    },
  ];

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Active Jobs"
              value={dashboardData?.counts?.totalActiveJobs || 0}
              icon={Briefcase}
              trend
              trendValue={`${dashboardData?.counts?.trends?.activeJobs || 0}%`}
              color="blue"
            />
            <StatCard
              title="Total Applicants"
              value={dashboardData?.counts?.totalApplications || 0}
              icon={Users}
              trend
              trendValue={`${dashboardData?.counts?.trends?.totalApplicants || 0}%`}
              color="green"
            />
            <StatCard
              title="Hired"
              value={dashboardData?.counts?.totalHired || 0}
              icon={CheckCircle2}
              trend
              trendValue={`${dashboardData?.counts?.trends?.totalHired || 0}%`}
              color="purple"
            />
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card
              title="Recent Job Posts"
              subtitle="Your latest job postings"
              headerAction={
                <button
                  onClick={() => navigate("/manage-jobs")}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              }
            >
              <div className="space-y-2">
                {dashboardData?.data?.recentJobs
                  ?.slice(0, 3)
                  ?.map((job, index) => (
                    <JobDashboardCard key={index} job={job} />
                  ))}
                {!dashboardData?.data?.recentJobs?.length && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No job posts yet
                  </p>
                )}
              </div>
            </Card>

            <Card
              title="Recent Applications"
              subtitle="Latest candidate applications"
              headerAction={
                <button
                  onClick={() => navigate("/manage-jobs")}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              }
            >
              <div className="space-y-2">
                {dashboardData?.data?.recentApplications
                  ?.slice(0, 3)
                  ?.map((data, index) => (
                    <ApplicantDashboardCard
                      key={index}
                      applicant={data?.applicant || ""}
                      position={data?.job?.title || ""}
                      time={moment(data?.updatedAt).fromNow()}
                    />
                  ))}
                {!dashboardData?.data?.recentApplications?.length && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No applications yet
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Quick actions */}
          <Card
            title="Quick Actions"
            subtitle="Common tasks to get you started"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-left bg-white group"
                >
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${action.color}`}
                  >
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                    {action.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerDashboard;
