import axios from "axios";
import { PYTHON_BASE } from "./apiPaths";

const pythonAxios = axios.create({
  baseURL: PYTHON_BASE,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
pythonAxios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    // Attach the token if your Python microservice requires authentication
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
pythonAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      if (error.response.status === 401) {
        // Redirect to login page on unauthorized
        window.location.href = "/";
      } else if (error.response.status === 500) {
        console.log("Python microservice error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.log("Python microservice request timeout. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default pythonAxios;
