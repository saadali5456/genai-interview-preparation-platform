import "../style/home.scss";
import { useState } from "react";
import { useInterview } from "../hooks/useinterview.js";
import { useNavigate } from "react-router";

const Home = () => {
    const { loading, generateReport, reports } = useInterview();
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleGenerateReport = async () => {
        navigator.vibrate?.(200);

        if (!jobDescription.trim()) {
            setErrorMessage("Please enter the target job description.");
            return;
        }

        if (!resumeFile && !selfDescription.trim()) {
            setErrorMessage("Upload a PDF resume or enter a self-description.");
            return;
        }

        setErrorMessage("");
        try {
            const data = await generateReport(jobDescription, selfDescription, resumeFile);
            const reportId = data?.interviewReport?._id ?? data?._id;
            if (reportId) {
                navigate(`/interview/${reportId}`);
            } else {
                setErrorMessage("The report was generated, but its ID was not returned.");
            }
        } catch (error) {
            const responseError = error.response?.data;
            setErrorMessage(
                responseError?.error
                    ? `${responseError.message}: ${responseError.error}`
                    : responseError?.message || "Could not generate your interview strategy. Please try again."
            );
        }
    };
    if (loading) {
        return (
            <main className="loading-screen">
                <h1> Loading your interview plan...</h1>
            </main>
        );
    }
    return (
        <main className="home"> 
            
<header className="home-heading">
    <h1>
        Create Your Custom <span>Interview Plan</span>
    </h1>

    <p>
        Let AI analyze the job requirements and your unique profile to build a
        <br className="desktop-break" /> winning strategy.
    </p>

    
</header>


            <section className="interview-panel" aria-label="Interview plan details">
                <div className="interview-input-group">
                    <section className="job-section">
                        <div className="section-heading">
                            <span className="section-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 4h6a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2Zm0 4h6V6H9v2Zm-5 4v6h16v-6h-5v2h-6v-2H4Z" />
                                </svg>
                            </span>
                            <label htmlFor="jobDescription">Target Job Description</label>
                            <span className="required-tag">REQUIRED</span>
                        </div>
                        <textarea
    name="jobDescription"
    id="jobDescription"
    maxLength={5000}
    value={jobDescription}
    onChange={(e) => setJobDescription(e.target.value)}
    placeholder={'Paste the full job description here...\ne.g. “Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...”'}
/>
                        <span className="character-counter" aria-hidden="true">0 / 5000 chars</span>
                    </section>

                    <section className="profile-section" aria-label="Your profile">
                        
<div className="section-heading profile-heading">
    <div className="profile-title">
        <span className="section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
            </svg>
        </span>
        <h2>Your Profile</h2>
    </div>

    <button
    type="button"
    className="button primary-button home-reports-button"
    onClick={() => navigate("/reports")}
>
    Previous Reports
</button>
</div>

                        <div className="input-group">
                            <p className="field-label">
                                Upload Resume <span className="optional-tag">BEST RESULTS</span>
                            </p>
                            <label className="file-label" htmlFor="resume">
                                <span className="upload-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.35 10.04A7.49 7.49 0 0 0 5 8a6 6 0 0 0 1 12h13a5 5 0 0 0 .35-9.96ZM13 17h-2v-4H8l4-4 4 4h-3v4Z" />
                                    </svg>
                                </span>
                                <strong>{resumeFile ? "PDF ready to upload" : "Click to upload or drag & drop"}</strong>
                                <span>{resumeFile ? resumeFile.name : <>PDF only <i>(Max 3MB)</i></>}</span>
                            </label>
                            <input
                                hidden
                                type="file"
                                name="resume"
                                id="resume"
                                accept=".pdf,application/pdf"
                                onChange={(event) => {
                                    const selectedFile = event.target.files?.[0];
                                    if (!selectedFile) {
                                        setResumeFile(null);
                                        return;
                                    }

                                    const isPdf = selectedFile.type === "application/pdf"
                                        || selectedFile.name.toLowerCase().endsWith(".pdf");
                                    if (!isPdf) {
                                        setResumeFile(null);
                                        event.target.value = "";
                                        setErrorMessage("Please select a PDF resume.");
                                        return;
                                    }

                                    if (selectedFile.size > 3 * 1024 * 1024) {
                                        setResumeFile(null);
                                        event.target.value = "";
                                        setErrorMessage("The PDF must be 3 MB or smaller.");
                                        return;
                                    }

                                    setResumeFile(selectedFile);
                                    setErrorMessage("");
                                }}
                            />
                        </div>

                        <div className="or-divider"><span>OR</span></div>

                        <div className="input-group description-group">
                            <label className="field-label" htmlFor="selfDescription">
                                Quick Self-Description
                            </label>
                            <textarea
    name="selfDescription"
    id="selfDescription"
    maxLength={5000}
    value={selfDescription}
    onChange={(e) => setSelfDescription(e.target.value)}
    placeholder="Briefly describe your experience, key skills, and years of experience if you don’t have a resume handy..."
/>

                        </div>

                        <p className="form-note">
                            <span aria-hidden="true">i</span>
                            Either a Resume or a Self-Description is required to generate a
                            personalized plan.
                        </p>
                    </section>
                </div> 
                {errorMessage && (
                    <p className="form-note" role="alert">{errorMessage}</p>
                )}

                <footer className="panel-footer">
                    <p>AI-Powered Strategy Generation <span>·</span> Approx. 30s</p>
                    <button  onClick={handleGenerateReport}className="button primary-button" type="button">
                        <span aria-hidden="true">✦</span> Generate My Interview Strategy
                    </button>
                </footer>
            </section>
        </main>
    );
};

export default Home;