import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import JobSeekerDashboard from "./pages/JobSeeker/JobSeekerDashboard";
import JobDetails from "./pages/JobSeeker/JobDetails";
import SavedJobs from "./pages/JobSeeker/SavedJobs";
import UserProfile from "./pages/JobSeeker/UserProfile";
import MyApplications from "./pages/JobSeeker/MyApplications";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import JobPostingForm from "./pages/Employer/JobPostingForm";
import ManageJobs from "./pages/Employer/ManageJobs";
import ApplicationViewer from "./pages/Employer/ApplicationViewer";
import EmployerProfilePage from "./pages/Employer/EmployerProfilePage";
import ProtectedRoute from "./routes/ProtectedRoutes";
import InterviewPage from "./pages/Interview/InterviewPage";
import InterviewHistory from "./pages/Interview/InterviewHistory";
import InterviewReview from "./pages/Interview/InterviewReview";
import CreateAssessment from "./pages/Assessment/employer/CreateAssessment";
import AssessmentResults from "./pages/Assessment/employer/AssessmentResults";
import AssessmentInstructions from "./pages/Assessment/candidate/AssessmentInstructions";
import AssessmentTest from "./pages/Assessment/candidate/AssessmentTest";
import AssessmentResult from "./pages/Assessment/candidate/AssessmentResult";
import EmployerAssessments from "./pages/Assessment/employer/EmployerAssessments";

function App() {
  return (
    <>
      <div className="">
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />{" "}
            <Route path="/find-jobs" element={<JobSeekerDashboard />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/interview-history" element={<InterviewHistory />} />
            <Route path="/interview/review/:id" element={<InterviewReview />} />
            <Route
              path="/assessment/:token"
              element={<AssessmentInstructions />}
            />
            <Route
              path="/assessment/:token/test"
              element={<AssessmentTest />}
            />
            <Route
              path="/assessment/:token/result"
              element={<AssessmentResult />}
            />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route
                path="/employer-dashboard"
                element={<EmployerDashboard />}
              />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applicants" element={<ApplicationViewer />} />
              <Route
                path="/company-profile"
                element={<EmployerProfilePage />}
              />
              <Route
                path="/employer/assessments"
                element={<EmployerAssessments />}
              />
              <Route
                path="/employer/assessments/create"
                element={<CreateAssessment />}
              />
              <Route
                path="/employer/assessments/:assessmentId/results"
                element={<AssessmentResults />}
              />
            </Route>
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={"/"} replace />} />
          </Routes>
        </Router>

        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </>
  );
}

export default App;
