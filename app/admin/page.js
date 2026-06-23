"use client";

import { useEffect, useMemo, useState } from "react";
import { DownloadSimple, Plus, SignOut, Trash, UsersThree } from "@phosphor-icons/react";
import BrandLogo from "@/components/BrandLogo";

export default function AdminPage() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Loading admin data...");

  async function loadAdminData() {
    const [studentsResponse, resultsResponse] = await Promise.all([
      fetch("/api/admin/students", { cache: "no-store", credentials: "same-origin" }),
      fetch("/api/admin/results", { cache: "no-store", credentials: "same-origin" })
    ]);

    if (studentsResponse.status === 401 || resultsResponse.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    const studentsData = await studentsResponse.json();
    const resultsData = await resultsResponse.json();
    setStudents(studentsData.students || []);
    setResults(resultsData.results || []);
    setMessage("");
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function addStudent(event) {
    event.preventDefault();
    setMessage("Saving student...");
    const response = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Could not add student.");
      return;
    }
    setEmail("");
    setName("");
    setMessage("Student registered.");
    await loadAdminData();
  }

  async function removeStudent(student) {
    const confirmed = window.confirm(
      `Remove ${student.email}? This will also permanently delete their submitted 64-question result.`
    );
    if (!confirmed) return;

    setMessage("Removing student and result...");
    const response = await fetch(`/api/admin/students?email=${encodeURIComponent(student.email)}`, {
      method: "DELETE"
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Could not remove student.");
      return;
    }

    const removedResults = data.removed?.submissionsRemoved || 0;
    setMessage(`Student removed. Deleted ${removedResults} result record${removedResults === 1 ? "" : "s"}.`);
    await loadAdminData();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  const csv = useMemo(() => {
    const header = ["Name", "Email", "Submitted At", "Personality Type", "EI", "SN", "TF", "JP"];
    const rows = results.map((result) => [
      result.name,
      result.email,
      result.submittedAt,
      result.result?.type,
      formatDimensionForCsv(result.result?.dimensions?.EI),
      formatDimensionForCsv(result.result?.dimensions?.SN),
      formatDimensionForCsv(result.result?.dimensions?.TF),
      formatDimensionForCsv(result.result?.dimensions?.JP)
    ]);
    return [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
  }, [results]);

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "personality-test-results.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <BrandLogo dark subtitle="Admin access and results" />
        <button className="text-button" onClick={logout}>
          <SignOut size={17} />
          Sign out
        </button>
      </header>

      <section className="admin-hero">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Register students. Review submissions.</h1>
        </div>
        <div className="admin-stats">
          <div>
            <small>Registered</small>
            <strong>{students.length}</strong>
          </div>
          <div>
            <small>Submitted</small>
            <strong>{results.length}</strong>
          </div>
        </div>
      </section>

      <section className="admin-grid">
        <form className="panel" onSubmit={addStudent}>
          <div className="panel-title">
            <UsersThree size={22} weight="duotone" />
            <h2>Add student</h2>
          </div>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional" />
          </label>
          <label className="field">
            <span>Google email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@example.com" required />
          </label>
          <button className="primary-button" type="submit">
            <Plus size={17} weight="bold" />
            Register email
          </button>
          {message && <p className="form-message">{message}</p>}
        </form>

        <div className="panel">
          <div className="panel-title">
            <UsersThree size={22} weight="duotone" />
            <h2>Registered students</h2>
          </div>
          <div className="list-table">
            {students.length === 0 ? (
              <p>No students registered yet.</p>
            ) : (
              students.map((student) => (
                <div key={student.email} className="list-row">
                  <span>
                    <strong>{student.name || "Unnamed student"}</strong>
                    <small>{student.email}</small>
                  </span>
                  <div className="list-row__actions">
                    <em>{student.hasSubmitted ? "Submitted" : "Not submitted"}</em>
                    <button className="danger-button" type="button" onClick={() => removeStudent(student)} aria-label={`Remove ${student.email}`}>
                      <Trash size={15} weight="bold" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="panel results-panel">
        <div className="panel-title panel-title--split">
          <div>
            <h2>Results</h2>
            <p>Showing computed Jung personality type and trait preference strengths.</p>
          </div>
          <button className="secondary-button" onClick={downloadCsv} disabled={results.length === 0}>
            <DownloadSimple size={17} />
            CSV
          </button>
        </div>

        {results.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <div className="results-list">
            {results.map((result) => (
              <article className="result-card" key={`${result.email}-${result.submittedAt}`}>
                <div className="result-head">
                  <span>
                    <strong>{result.name || "Student"}</strong>
                    <small>{result.email}</small>
                  </span>
                  <time>{new Date(result.submittedAt).toLocaleString()}</time>
                </div>
                <div className="personality-result">
                  <div className="type-summary">
                    <strong>{result.result?.type || "Pending"}</strong>
                    <h3>{formatHumanmetricsTitle(result.result?.typeTitle)}</h3>
                  </div>

                  <h4 className="trait-heading">Your trait preferences:</h4>
                  <ul className="trait-list">
                    {Object.entries(result.result?.dimensions || {}).map(([key, dimension]) => (
                      <li key={`${result.email}-${key}`}>
                        <span className="trait-label">{dimension.label.toLowerCase()} ({dimension.strength}%)</span>
                        preference of <strong>{dimension.winnerName}</strong> over {dimension.loserName}
                      </li>
                    ))}
                  </ul>

                  <div className="trait-bars">
                    {Object.entries(result.result?.dimensions || {}).map(([key, dimension]) => (
                      <div className="trait-bar" key={`${result.email}-${key}-bar`}>
                        <span>{dimension.leftName}</span>
                        <div className="trait-track">
                          <i style={{ transform: `translateX(calc(${50 + dimension.signedPreference / 2}% - 50%))` }}>
                            {dimension.strength}
                          </i>
                        </div>
                        <span>{dimension.rightName}</span>
                      </div>
                    ))}
                  </div>
                  <p className="result-note">{result.result?.notes}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDimensionForCsv(dimension) {
  if (!dimension) return "";
  return `${dimension.winnerName} ${dimension.strength}% (${dimension.label})`;
}

function formatHumanmetricsTitle(title) {
  return title?.replace("Intuition", "iNtuitive") || "";
}
