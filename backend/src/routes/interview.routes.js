const express = require("express");
const interviewController = require("../controllers/interview.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewRouter = express.Router();
const upload = require("../middlewares/file.middleware");
/**
 * @route POST /api/interview
 * @desc Generate an interview report based on the candidate's resume, self-description, and job description.
 * @access private
 */
interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    interviewController.generateInterviewReportController
);

/**
 * @route GET /api/interview/report/:interviewId
 * @desc Get a specific interview report by its ID.
 * @access private
 */
interviewRouter.get(
    "/report/:interviewId",
    authMiddleware.authUser,
    interviewController.getInterviewReportByIdController
);

/**
 * @route GET /api/interview/reports
 * @desc Get all interview reports for the authenticated user.
 * @access private
 */
interviewRouter.get(
    "/reports",
    authMiddleware.authUser,
    interviewController.getAllInterviewReportsController
);
/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description
 * @access private
 * 
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)
interviewRouter.post(
    "/resume/docx/:interviewReportId",
    authMiddleware.authUser,
    interviewController.generateResumeDocxController
);

module.exports = interviewRouter;