import { useState } from "react";
import { useLocation, useParams } from "react-router";
import "../style/interview.scss";

const demoReport = {
  matchScore: 75,
  technicalQuestions: [
    {
      question: "Can you explain how you implemented JWT-based authentication in your Recipe Suggestion App using Node.js and Express?",
      intention: "Evaluate practical understanding of backend security, REST APIs, and authentication mechanisms.",
      answer: "Explain how a token is generated after login, signed with a secret, stored securely in cookies, and verified by middleware on protected routes."
    },
    {
      question: "How do you manage state and data flow between a frontend application and a backend REST API?",
      intention: "Assess knowledge of full-stack architecture, API integration, and database operations.",
      answer: "Describe how frontend components make asynchronous requests and how the Express backend uses Mongoose to perform database operations and return JSON."
    },
    {
      question: "What is the difference between SQL and NoSQL databases, and why did you choose MongoDB?",
      intention: "Test database selection rationale and understanding of relational and document-oriented data.",
      answer: "Compare relational tables with flexible documents, then explain why the recipe data's varying ingredients and metadata suited MongoDB."
    }
  ],
  behavioralQuestions: [
    {
      question: "Tell me about a time when you had to learn a new technology quickly for a project. How did you approach it?",
      intention: "Evaluate adaptability, self-learning capability, and problem-solving with an unfamiliar stack.",
      answer: "Describe how you picked up TypeScript, Node.js, and Tailwind CSS for your Recipe Suggestion App by following documentation, building small prototypes, and applying concepts iteratively."
    },
    {
      question: "Describe a project where you faced a significant technical hurdle and how you resolved it.",
      intention: "Assess debugging skills, resilience, and analytical thinking during development challenges.",
      answer: "Discuss the data-leakage issue in your battery-estimation project, how you found it, and how a chronological cycle-level split helped validate the solution."
    }
  ],
  skillGaps: [
    { skill: "JavaScript", severity: "hard skill" },
    { skill: "React", severity: "hard skill" },
    { skill: "OOP", severity: "knowledge gap" },
    { skill: "DSA", severity: "knowledge gap" }
  ],
  preparationPlans: [
    {
      day: 1,
      focus: "React and Frontend Fundamentals",
      tasks: [
        "Review components, props, state, and hooks.",
        "Build small component-based user interfaces.",
        "Review state management in single-page applications."
      ]
    },
    {
      day: 2,
      focus: "Advanced JavaScript and OOP",
      tasks: [
        "Review modern JavaScript features and asynchronous programming.",
        "Practice inheritance, encapsulation, and polymorphism."
      ]
    },
    {
      day: 3,
      focus: "Data Structures and Algorithms",
      tasks: [
        "Solve problems involving arrays, strings, and hash maps.",
        "Review basic searching and sorting algorithms."
      ]
    },
    {
      day: 4,
      focus: "Full Stack Integration and REST APIs",
      tasks: [
        "Review Express routing, middleware, and error handling.",
        "Practice connecting a Node.js backend with MongoDB.",
        "Prepare to explain your project architecture."
      ]
    }
  ]
};

const sections = [
  { id: "technicalQuestions", label: "Technical questions" },
  { id: "behavioralQuestions", label: "Behavioral questions" },
  { id: "preparationPlans", label: "Road Map" }
];

const Interview = ({ report: reportProp }) => {
  const location = useLocation();
  const { interviewId } = useParams();

  const report = reportProp ?? location.state?.report ?? demoReport;

  const interviewReportId =
    reportProp?._id ??
    reportProp?.id ??
    location.state?.report?._id ??
    location.state?.report?.id ??
    report?._id ??
    report?.id ??
    location.state?.interviewReportId ??
    interviewId;

  const [downloading, setDownloading] = useState("");
  const [downloadError, setDownloadError] = useState("");

  const downloadResume = async (format) => {
    if (!interviewReportId) {
      setDownloadError("Please generate a real interview report before downloading a resume.");
      return;
    }

    setDownloading(format);
    setDownloadError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${apiUrl}/api/interview/resume/${format}/${interviewReportId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download ${format.toUpperCase()}.`);
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = `resume-${interviewReportId}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setDownloadError(error.message || "Something went wrong while downloading.");
    } finally {
      setDownloading("");
    }
  };

  const matchScore = Number.isFinite(report.matchScore)
    ? Math.min(100, Math.max(0, report.matchScore))
    : 0;
  const matchSummary = matchScore >= 80
    ? "Strong match for this role"
    : matchScore >= 60
      ? "Good alignment with this role"
      : "Room to strengthen your fit";
  const [activeSection, setActiveSection] = useState("technicalQuestions");
  const activeLabel = sections.find((section) => section.id === activeSection)?.label;
  const items = report[activeSection] ?? [];

  return (
    <main className="interview-page">
      <div className="interview-shell">
        <aside className="interview-sidebar" aria-label="Report navigation">
                    <nav className="interview-nav" role="tablist" aria-label="Interview report sections">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`interview-nav-button${activeSection === section.id ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activeSection === section.id}
                aria-controls="interview-content"
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <section
          className="interview-content"
          id="interview-content"
          role="tabpanel"
          aria-label={activeLabel}
        >
          

<header className="interview-content-header">
  <p className="interview-eyebrow">YOUR INTERVIEW REPORT</p>
  <h1>{activeLabel}</h1>
  <p className="interview-content-count">
    {activeSection === "preparationPlans"
      ? `${items.length} days in your preparation plan`
      : `${items.length} questions tailored to your profile`}
  </p>
</header>

<div className="resume-download-actions">
  <button
    type="button"
    onClick={() => downloadResume("pdf")}
    disabled={Boolean(downloading)}
  >
    {downloading === "pdf" ? "Generating PDF..." : "Download PDF"}
  </button>

  <button
    type="button"
    onClick={() => downloadResume("docx")}
    disabled={Boolean(downloading)}
  >
    {downloading === "docx" ? "Generating DOCX..." : "Download DOCX"}
  </button>
</div>

{downloadError && (
  <p role="alert" className="download-error">
    {downloadError}
  </p>
)}




          <div className="interview-content-list">
            {items.length === 0 ? (
              <p className="interview-empty-state">No content is available for this section yet.</p>
            ) : activeSection === "preparationPlans" ? (
              items.map((plan, index) => (
                <article className="report-card roadmap-card" key={`${plan.day}-${index}`}>
                  <p className="report-card-kicker">DAY {String(plan.day).padStart(2, "0")}</p>
                  <h2>{plan.focus}</h2>
                  <ul>
                    {plan.tasks.map((task, taskIndex) => (
                      <li key={`${plan.day}-task-${taskIndex}`}>{task}</li>
                    ))}
                  </ul>
                </article>
              ))
            ) : (
              items.map((item, index) => (
                <article className="report-card question-card" key={`${activeSection}-${index}`}>
                  <p className="report-card-kicker">QUESTION {String(index + 1).padStart(2, "0")}</p>
                  <h2>{item.question}</h2>
                  <div className="report-card-detail">
                    <h3>What this assesses</h3>
                    <p>{item.intention}</p>
                  </div>
                  <div className="report-card-detail answer-detail">
                    <h3>Suggested answer</h3>
                    <p>{item.answer}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="skill-sidebar" aria-labelledby="skill-gaps-title">
          <section className="match-score-panel" aria-labelledby="match-score-title">
            <h2 id="match-score-title">Match Score</h2>
            <div
              className="match-score-gauge"
              role="progressbar"
              aria-label="Match score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={matchScore}
              style={{ "--match-score": `${matchScore}%` }}
            >
              <span>{matchScore}<small>%</small></span>
            </div>
            <p>{matchSummary}</p>
          </section>

          <div className="skill-score-divider" />
          <div className="skill-sidebar-heading">
            <span className="skill-heading-mark" aria-hidden="true" />
            <h2 id="skill-gaps-title">Skill Gaps</h2>
          </div>
          <div className="skill-chip-list">
            {(report.skillGaps ?? []).map((gap, index) => (
              <span
                className="skill-chip"
                key={`${gap.skill}-${index}`}
                title={gap.severity}
              >
                {gap.skill}
              </span>
            ))}
          </div>
          {!(report.skillGaps ?? []).length && (
            <p className="skill-empty-state">No skill gaps found.</p>
          )}
        </aside>
      </div>
    </main>
  );
};

export default Interview;