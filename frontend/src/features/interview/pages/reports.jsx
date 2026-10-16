
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useInterview } from "../hooks/useinterview.js";

const Reports = () => {
  const { reports, fetchAllReports, loading } = useInterview();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllReports().catch(() => {
      setError("Could not load your previous reports. Please try again.");
    });
  }, []);

  return (
    <main className="reports-page">
      <header className="reports-header">
        <h1>Previous Interview Reports</h1>
        <p>
          Review your previously generated interview reports
          and preparation strategies.
        </p>
      </header>

      {loading && <p>Loading your reports...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p className="reports-empty">
          You haven't generated any interview reports yet.
        </p>
      )}

      <section className="reports-grid">
        {reports.map((report) => {
          const id = report._id ?? report.id;

          return (
            <article className="report-card" key={id}>
              <h2>
                {report.jobTitle ||
                  report.jobDescription?.slice(0, 80) ||
                  "Interview report"}
              </h2>

              <p className="report-score">
                Match score:{" "}
                {Number.isFinite(report.matchScore)
                  ? `${report.matchScore}%`
                  : "Not available"}
              </p>

              <p className="report-date">
                Created:{" "}
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleDateString()
                  : "Date unavailable"}
              </p>

              <button
                type="button"
                className="report-button"
                disabled={!id}
                onClick={() => navigate(`/interview/${id}`)}
              >
                Open report
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default Reports;
