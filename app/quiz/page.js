"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, SignOut, WarningCircle } from "@phosphor-icons/react";
import { assessmentQuestions } from "@/data/personalityQuestions";
import BrandLogo from "@/components/BrandLogo";

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(assessmentQuestions.length).fill(null));
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("Loading your session...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!response.ok) {
        window.location.href = "/student/login";
        return;
      }
      const data = await response.json();
      if (data.user?.hasSubmitted) {
        setIsSubmitted(true);
        setMessage("You have already submitted this assessment. Thank you.");
        return;
      }
      setUser(data.user);
      setMessage("");
    }

    loadUser();
  }, []);

  const completed = answers.filter(Boolean).length;
  const pending = assessmentQuestions.length - completed;
  const currentAnswer = answers[currentIndex];
  const currentQuestion = assessmentQuestions[currentIndex];
  const canSubmit = completed === assessmentQuestions.length;

  const preview = useMemo(
    () =>
      answers.map((answer, index) => ({
        index,
        status: answer ? "completed" : index < currentIndex ? "skipped" : "pending"
      })),
    [answers, currentIndex]
  );

  function setAnswer(value) {
    setAnswers((previous) => {
      const next = [...previous];
      next[currentIndex] = value;
      return next;
    });
  }

  async function submitQuiz() {
    setIsSubmitting(true);
    setMessage("Submitting your answers...");
    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    const data = await response.json();
    setIsSubmitting(false);
    if (!response.ok) {
      setMessage(data.message || "Submission failed.");
      return;
    }
    setIsSubmitted(true);
    setMessage(data.message);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (isSubmitted) {
    return (
      <div className="thank-you-page">
        <div className="thank-you-card">
          <CheckCircle size={42} weight="duotone" />
          <p className="eyebrow">Submission received</p>
          <h1>Thank you for completing the assessment.</h1>
          <p>{message || "Your responses have been recorded successfully. We will get back to you soon to discuss your results with care and clarity."}</p>
          <button className="secondary-button" onClick={logout}>Return home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-layout">
      <aside className="quiz-sidebar">
        <Link href="/" aria-label="Personality test home">
          <BrandLogo dark subtitle={user?.email || "Student session"} />
        </Link>

        <div className="progress-stack">
          <div>
            <small>Completed</small>
            <strong>{completed}</strong>
          </div>
          <div>
            <small>Pending</small>
            <strong>{pending}</strong>
          </div>
          <div>
            <small>Skipped</small>
            <strong>{preview.filter((item) => item.status === "skipped").length}</strong>
          </div>
        </div>

        <div className="question-map" aria-label="Question navigation">
          {preview.map((item) => (
            <button
              key={item.index}
              className={`question-dot question-dot--${item.status} ${currentIndex === item.index ? "is-active" : ""}`}
              onClick={() => setCurrentIndex(item.index)}
              aria-label={`Question ${item.index + 1}, ${item.status}`}
            >
              {item.index + 1}
            </button>
          ))}
        </div>

        <button className="text-button" onClick={logout}>
          <SignOut size={17} />
          Sign out
        </button>
      </aside>

      <section className="quiz-stage">
        <div className="mobile-status">
          <span>{completed}/{assessmentQuestions.length} completed</span>
          <button className="text-button" onClick={logout}>
            <SignOut size={16} />
            Sign out
          </button>
        </div>

        <article className="question-card">
          <div className="question-meta">
            <span>Question {currentIndex + 1} of {assessmentQuestions.length}</span>
            {currentAnswer ? (
              <span className="status-chip status-chip--done">
                <CheckCircle size={16} weight="fill" />
                Answered
              </span>
            ) : (
              <span className="status-chip">
                <Circle size={16} />
                Pending
              </span>
            )}
          </div>

          <h1>{currentQuestion.prompt}</h1>

          <div className="answer-grid">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                className={currentAnswer === option.value ? "answer-card is-selected" : "answer-card"}
                onClick={() => setAnswer(option.value)}
              >
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>

          <div className="quiz-actions">
            <button className="secondary-button quiz-nav-button" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
              <ArrowLeft size={17} />
              Previous
            </button>
            {currentIndex < assessmentQuestions.length - 1 ? (
              <button className="primary-button" onClick={() => setCurrentIndex(Math.min(assessmentQuestions.length - 1, currentIndex + 1))}>
                Next
                <ArrowRight size={17} />
              </button>
            ) : (
              <button className="primary-button" onClick={submitQuiz} disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>

          {!canSubmit && currentIndex === assessmentQuestions.length - 1 && (
            <p className="inline-warning">
              <WarningCircle size={17} weight="bold" />
              Answer all {assessmentQuestions.length} questions before submitting.
            </p>
          )}

          {message && <p className="form-message">{message}</p>}
        </article>
      </section>
    </div>
  );
}
