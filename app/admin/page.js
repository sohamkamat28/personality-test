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
  const [isSaving, setIsSaving] = useState(false);

  async function fetchJson(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
        ...options,
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      return { response, data };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function loadAdminData() {
    try {
      const [studentsResult, resultsResult] = await Promise.all([
        fetchJson("/api/admin/students"),
        fetchJson("/api/admin/results")
      ]);

      if (studentsResult.response.status === 401 || resultsResult.response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!studentsResult.response.ok) {
        throw new Error(studentsResult.data.message || "Could not load registered students.");
      }

      if (!resultsResult.response.ok) {
        throw new Error(resultsResult.data.message || "Could not load results.");
      }

      setStudents(studentsResult.data.students || []);
      setResults(resultsResult.data.results || []);
      setMessage("");
    } catch (error) {
      setMessage(
        error.name === "AbortError"
          ? "The admin data is taking too long to load. Please check your database connection and refresh."
          : error.message || "Could not load admin data. Please refresh and try again."
      );
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function addStudent(event) {
    event.preventDefault();
    if (isSaving) return;

    setMessage("Saving student...");
    setIsSaving(true);

    try {
      const { response, data } = await fetchJson("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name })
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Could not add student.");
        return;
      }

      setStudents((current) => {
        const withoutExisting = current.filter((student) => student.email !== data.student.email);
        return [data.student, ...withoutExisting].sort((a, b) => a.email.localeCompare(b.email));
      });
      setEmail("");
      setName("");
      setMessage("Student registered.");
    } catch (error) {
      setMessage(
        error.name === "AbortError"
          ? "Saving took too long. Please check your database connection and try again."
          : error.message || "Could not add student. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function removeStudent(student) {
    const confirmed = window.confirm(
      `Remove ${student.email}? This will also permanently delete their submitted 64-question result.`
    );
    if (!confirmed) return;

    setMessage("Removing student and result...");
    try {
      const { response, data } = await fetchJson(`/api/admin/students?email=${encodeURIComponent(student.email)}`, {
        method: "DELETE"
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setMessage(data.message || "Could not remove student.");
        return;
      }

      const removedResults = data.removed?.submissionsRemoved || 0;
      setStudents((current) => current.filter((item) => item.email !== student.email));
      setResults((current) => current.filter((item) => item.email !== student.email));
      setMessage(`Student removed. Deleted ${removedResults} result record${removedResults === 1 ? "" : "s"}.`);
    } catch (error) {
      setMessage(
        error.name === "AbortError"
          ? "Removing took too long. Please check your database connection and try again."
          : error.message || "Could not remove student. Please try again."
      );
    }
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
          <button className="primary-button" type="submit" disabled={isSaving}>
            <Plus size={17} weight="bold" />
            {isSaving ? "Saving..." : "Register email"}
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
