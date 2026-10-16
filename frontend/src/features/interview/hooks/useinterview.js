import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
} from "../services/interview.api";
import { useContext } from "react";
import { InterviewContext } from "../interview.context.jsx";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } = context;

  const generateReport = async (jobDescription, selfDescription, resumeFile) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport(
        jobDescription,
        selfDescription,
        resumeFile
      );
      setReport(response?.interviewReport ?? response);
      return response;
    } catch (error) {
      console.error("Failed to generate interview report:", error);
      throw error;
    } finally {
      setLoading(false);
    }
    
  };

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const data = await getAllInterviewReports();
      setReports(data?.interviewReports ?? data?.reports ?? []);
      return data;
    } catch (error) {
      console.error("Failed to fetch interview reports:", error);
      throw error;
    } finally {
      setLoading(false);
    }
    
  };

  const fetchReportById = async (id) => {
    setLoading(true);
    try {
      const data = await getInterviewReportById(id);
      setReport(data?.interviewReport ?? data);
      return data;
    } catch (error) {
      console.error("Failed to fetch interview report:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    report,
    reports,
    generateReport,
    fetchAllReports,
    fetchReportById,
    setReport,
    setReports,
  };
};
