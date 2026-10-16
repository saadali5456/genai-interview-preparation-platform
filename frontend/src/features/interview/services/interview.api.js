
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

/**
 * Generate an interview report.
 */
export const generateInterviewReport = async (
  jobDescription,
  selfDescription,
  resumeFile
) => {
  const formData = new FormData();

  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  formData.append("selfDescription", selfDescription);
  formData.append("jobDescription", jobDescription);

  const response = await api.post("/api/interview/", formData);
  return response.data;
};

/**
 * Get one interview report by ID.
 */
export const getInterviewReportById = async (interviewId) => {
  const response = await api.get(
    `/api/interview/report/${interviewId}`
  );

  return response.data;
};

/**
 * Get all interview reports for the logged-in user.
 */
export const getAllInterviewReports = async () => {
  const response = await api.get("/api/interview/reports");
  return response.data;
};
