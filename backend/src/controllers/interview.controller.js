const pdfParse = require("pdf-parse");
const {generateInterviewReport, generateResumePdf, generateResumeDocx } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "jobDescription is required"
            });
        }

        if (!req.file && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Please upload a PDF resume or provide a self-description"
            });
        }

        if (req.file && req.file.mimetype !== "application/pdf") {
            return res.status(400).json({
                message: "Resume must be a PDF file"
            });
        }

        let resumeContent = null;
        if (req.file) {
            const parser = new pdfParse.PDFParse({ data: req.file.buffer });
            try {
                resumeContent = await parser.getText();
            } finally {
                await parser.destroy();
            }
        }
        const resumeText = resumeContent?.text || "";

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription
        });

        const interviewReport = new interviewReportModel({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        await interviewReport.save();

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });
    } catch (error) {
        console.error("Failed to generate interview report:", error);
        return res.status(500).json({
            message: "Failed to generate interview report",
            error: error.message
        });
    }
}

/**
 * 
 * @description Controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found" });
        }

        return res.status(200).json({
            message: "Interview report retrieved successfully",
            interviewReport
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch interview report",
            error: error.message
        });
    }
}
/**
 * @description Controller to get all interview reports for the authenticated user
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -skillGaps -preparationPlans");

        return res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch interview reports",
            error: error.message
        });
    }
}

/**
 * @description: controller to generate resume PDF based on user self description, resume and job description
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition":
                `attachment; filename="resume-${interviewReportId}.pdf"`
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Failed to generate resume PDF:", error);

        return res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        });
    }
}

async function generateResumeDocxController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const docxBuffer = await generateResumeDocx({
            resume,
            jobDescription,
            selfDescription
        });

        res.set({
            "Content-Type":
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition":
                `attachment; filename="resume-${interviewReportId}.docx"`
        });

        return res.send(docxBuffer);
    } catch (error) {
        console.error("Failed to generate resume DOCX:", error);

        return res.status(500).json({
            message: "Failed to generate resume DOCX",
            error: error.message
        });
    }
}



module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    generateResumeDocxController
};
