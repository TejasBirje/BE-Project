import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  Briefcase,
  Building2,
  LayoutDashboard,
  Plus,
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Connect with Opportunities",
    description:
      "Discover job opportunities from multiple companies for different roles",
  },
  {
    icon: FileText,
    title: "Easy Apply",
    description:
      "Apply to jobs quickly using your profile without filling long forms every time.",
  },
  {
    icon: Users,
    title: "Wide Range of Jobs",
    description:
      "Browse a large collection of job listings including full-time, remote, and internships.",
  },
  {
    icon: Shield,
    title: "Genuine Job Listings",
    description:
      "All job postings are reviewed to ensure they come from real and verified employers.",
  },
];

export const employerFeatures = [
  {
    icon: Users,
    title: "Access to Candidates",
    description:
      "Reach a growing pool of job seekers looking for opportunities in different domains.",
  },
  {
    icon: Briefcase,
    title: "Post Jobs Easily",
    description: "Create and publish job listings in just a few steps.",
  },
  {
    icon: FileText,
    title: "Manage Applications",
    description:
      "View, track, and manage all candidate applications in one place.",
  },
  {
    icon: Clock,
    title: "Faster Hiring Process",
    description:
      "Reduce manual work by handling hiring workflows directly on the platform.",
  },
];

// Navigation items configuration
export const NAVIGATION_MENU = [
  { id: "employer-dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "post-job", name: "Post Job", icon: Plus },
  { id: "manage-jobs", name: "Manage Jobs", icon: Briefcase },
  { id: "company-profile", name: "Company Profile", icon: Building2 },
  { id: "employer/assessments", name: "Assessments", icon: BarChart3 },
];

// Categories and job types
export const CATEGORIES = [
  { value: "Engineering", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "IT & Software", label: "IT & Software" },
  { value: "Customer-service", label: "Customer Service" },
  { value: "Product", label: "Product" },
  { value: "Operations", label: "Operations" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "Human Resources" },
  { value: "Other", label: "Other" },
];

export const JOB_TYPES = [
  { value: "Remote", label: "Remote" },
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

export const SALARY_RANGES = [
  "Less than 5LPA",
  "5LPA-10LPA",
  "More than 10LPA",
];
