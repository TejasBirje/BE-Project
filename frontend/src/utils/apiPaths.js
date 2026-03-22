// apiPaths.js

// Main Node/Express Backend
export const BASE_URL = "http://localhost:5000";

// Python Microservice
export const PYTHON_BASE = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Signup
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    UPDATE_PROFILE: "/api/user/profile", // Update profile details
    DELETE_RESUME: "/api/user/resume", // Delete Resume details
  },

  DASHBOARD: {
    OVERVIEW: `/api/analytics/overview`,
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,

    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: "/api/save-jobs/my",
  },
  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    GET_MY_APPLICATIONS: "/api/applications/my",
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
    SEND_INTERVIEW_INVITE: (id) => `/api/applications/${id}/invite`,
    RECALCULATE_ATS: (id) => `/api/applications/${id}/recalculate-ats`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
  },
  RESUME: {
    UPLOAD: "/api/user/upload-resume", // Upload PDF → creates Resume doc → returns resumeId + url
    DELETE: "/api/user/resume", // Delete resume
    REPAIR: "/api/user/repair-resume", // Re-extract text from existing PDF
  },

  INTERVIEW: {
    // HTTP endpoints (CRUD)
    GET: (id) => `/api/interview/${id}`,
    USER_ALL: "/api/interview/user/all",
    // Socket.io events — handled via socket.io-client, not HTTP:
    // emit: joinInterview, chatMessage, endInterview
    // listen: interviewStarted, aiResponseChunk, aiResponseComplete, interviewComplete, error
  },

  PYTHON: {
    SELECT_QUESTIONS: "/select_questions",
    CALCULATE_SCORE: "/calculate_weighted_score",
    EXTRACT_KEYWORDS: "/extract_keywords",
  },

  ASSESSMENT: {
    CREATE: "/api/assessments/create",
    MY_ASSESSMENTS: "/api/assessments/my-assessments",
    GET_BY_ID: (id) => `/api/assessments/${id}`,
    SEND_INVITE: "/api/assessments/invite",
    GET_RESULTS: (id) => `/api/assessments/${id}/results`,
    GET_CANDIDATE_RESULT: (id, candidateId) =>
      `/api/assessments/${id}/results/${candidateId}`,
    DELETE: (id) => `/api/assessments/${id}`,
  },
  ATTEMPT: {
    VALIDATE_TOKEN: (token) => `/api/attempt/invite/${token}`,
    START: (token) => `/api/attempt/start/${token}`,
    SAVE: (token) => `/api/attempt/save/${token}`,
    SUBMIT: (token) => `/api/attempt/submit/${token}`,
    RESULT: (token) => `/api/attempt/result/${token}`,
  },
};
