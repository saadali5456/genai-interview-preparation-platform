const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const {zodToJsonSchema} = require("zod-to-json-schema")
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEN_AI_API_KEY
});

const puppeteer = require("puppeteer")
const htmlToDocx = require("html-to-docx");

// ===============================
// Interview Report Schema
// ===============================

const interviewReportSchema = z.object({

    matchScore: z.number()
        .min(0)
        .max(100)
        .describe(
            "A score from 0 to 100 indicating how well the candidate's resume, skills, and experience match the job description."
        ),

    technicalQuestions: z.array(
        z.object({

            question: z.string()
                .describe(
                    "A technical interview question relevant to the candidate's skills and the requirements of the job."
                ),

            intention: z.string()
                .describe(
                    "The purpose of the technical question and the specific knowledge, skill, or concept the interviewer is trying to evaluate."
                ),

            answer: z.string()
                .describe(
                    "A suggested interview answer explaining what the candidate should say and which important points, concepts, or approach should be covered."
                )

        })
    ).describe(
        "A list of technical interview questions relevant to the job, including the intention behind each question and a suggested answer."
    ),


    behavioralQuestions: z.array(
        z.object({

            question: z.string()
                .describe(
                    "A behavioral interview question designed to evaluate the candidate's communication, teamwork, leadership, problem-solving, adaptability, or other soft skills."
                ),

            intention: z.string()
                .describe(
                    "The purpose of the behavioral question and the specific soft skill, behavior, or experience the interviewer is trying to assess."
                ),

            answer: z.string()
                .describe(
                    "A suggested way for the candidate to answer the behavioral question, including the important points and experiences they should discuss."
                )

        })
    ).describe(
        "A list of behavioral interview questions, including the intention behind each question and a suggested answer."
    ),


    skillGaps: z.array(
        z.object({

            skill: z.string()
                .describe(
                    "A technical or professional skill that the candidate currently lacks or needs to improve based on the job description."
                ),

            severity: z.enum(["hard skill", "soft skill", "knowledge gap"])
                .describe(
                    "The severity of the skill gap based on how important the skill is for successfully performing the target job."
                )

        })
    ).describe(
        "A list of skills the candidate should improve, along with the severity of each skill gap."
    ),


    preparationPlans: z.array(
        z.object({

            day: z.number()
                .describe(
                    "The day number in the preparation plan."
                ),

            focus: z.string()
                .describe(
                    "The main topic, skill, or subject the candidate should focus on during this day."
                ),

            tasks: z.array(z.string())
                .describe(
                    "Specific tasks, exercises, or activities the candidate should complete during this day."
                )

        })
    ).describe(
        "A day-by-day interview preparation plan containing the focus area and specific tasks the candidate should complete."
    ),

    title: z.string().describe(
        "The title of the job for which the interview report is generated."
    )
});

const reportJsonSchema = z.toJSONSchema(interviewReportSchema);
delete reportJsonSchema.$schema;


// ===============================
// Generate Interview Report
// ===============================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

const prompt = `
You are an AI assistant helping evaluate a job candidate.

Generate a comprehensive interview preparation report based on the candidate's resume, self-description, and the target job description.

IMPORTANT:
You MUST follow the exact JSON structure required by the provided response schema.

Use camelCase field names exactly as specified by the schema.

The report must contain:

1. matchScore
   - A number from 0 to 100.

2. technicalQuestions
   - An array of objects.
   - Every object MUST contain:
     - question
     - intention
     - answer

3. behavioralQuestions
   - An array of objects.
   - Every object MUST contain:
     - question
     - intention
     - answer

4. skillGaps
   - An array of objects.
   - Every object MUST contain:
     - skill
     - severity
   - severity MUST be exactly one of:
     - "hard skill"
     - "soft skill"
     - "knowledge gap"

5. preparationPlans
   - An array of objects.
   - Every object MUST contain:
     - day
     - focus
     - tasks
   - tasks MUST be an array of strings.

DO NOT use snake_case names such as:
match_score
technical_questions
behavioral_questions
skill_gaps
preparation_plan

DO NOT return technical questions or behavioral questions as plain strings.
They MUST be objects containing question, intention, and answer.

DO NOT return skill gaps as plain strings.
They MUST be objects containing skill and severity.

Use the candidate's actual information and the requirements of the job description.

Do not invent qualifications or experiences that are not present in the provided information.

Candidate Resume:
${resume}

Candidate Self-Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    // ===============================
    // Retry Gemini request
    // ===============================

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: reportJsonSchema,
                    temperature: 0
                }
            });

            return interviewReportSchema.parse(JSON.parse(response.text));

        } catch (error) {

            console.log(
                `Gemini attempt ${attempt} failed:`,
                error.status,
                error.message
            );

            // If this was the final attempt,
            // throw the error.

            if (attempt === maxRetries) {

                console.log(
                    "Gemini request failed after multiple attempts."
                );

                throw error;
            }

            // Wait before retrying.

            const delay = attempt * 2000;

            console.log(
                `Retrying in ${delay / 1000} seconds...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );

        }
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();

    try {
        const page = await browser.newPage();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

async function generateResumePdf ({ resume,  selfDescription , jobDescription}){
    const resumepdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converetd to PDF using any library like puppeteer")
    })
    const prompt = `Generate a resume PDF for a candidate with the following details: 
                      Resume ${resume}
                      Self Description: ${selfDescription}
                      Job Description: ${jobDescription}
                      the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library   `

                      const response = await ai.models.generateContent({
                         model: "gemini-3-flash-preview",
                         contents : prompt,
                         config:{
                            responseMimeType : "application/json",
                            responseSchema: zodToJsonSchema(resumepdfSchema),
                         }
                      })
                    const jsonContent =  JSON.parse(response.text)
                    const pdfBuffer = await generatePdfFromHtml (jsonContent.html)
                    return pdfBuffer
}

async function generateResumeDocx({ resume, selfDescription, jobDescription }) {
    const resumepdfSchema = z.object({
        html: z.string().describe(
            "Complete, valid HTML for a professional resume. Use semantic headings, paragraphs, and lists. Do not include scripts or external resources."
        )
    });

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
Create a professional, editable resume using the candidate information below.

Use only information supplied by the candidate. Do not invent names, degrees,
employers, dates, achievements, or skills. Use a clean layout with clear
sections for contact details, summary, education, skills, experience, and projects
where relevant. Return HTML in the required JSON format.

Resume:
${resume || "Not provided"}

Self-description:
${selfDescription || "Not provided"}

Target job description:
${jobDescription || "Not provided"}
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumepdfSchema)
        }
    });

    const parsedResponse = JSON.parse(response.text);

console.log("Gemini DOCX response:", parsedResponse);
const { resume_html } = z.object({
    resume_html: z.string()
}).parse(parsedResponse);

const html = resume_html;

    return await htmlToDocx(html, null, {
        table: { row: { cantSplit: true } },
        footer: false,
        pageNumber: false
    });
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
    generateResumeDocx
};