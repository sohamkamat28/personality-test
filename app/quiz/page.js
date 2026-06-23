"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, SignOut, WarningCircle, X } from "@phosphor-icons/react";
import { assessmentQuestions } from "@/data/personalityQuestions";
import BrandLogo from "@/components/BrandLogo";

function sessionErrorContent(message) {
  return {
    title: "Session needs attention",
    message:
      message ||
      "Your session could not be verified. Please sign in again from the device you want to use for the assessment."
  };
}

function isValidSavedAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== assessmentQuestions.length) return false;
  return answers.every((answer, index) => {
    return answer === null || assessmentQuestions[index].options.some((option) => option.value === answer);
  });
}

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(assessmentQuestions.length).fill(null));
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("Loading your session...");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProgressReady, setIsProgressReady] = useState(false);
  const [dialog, setDialog] = useState(null);
  const questionCardRef = useRef(null);

  useEffect(() => {
    async function loadUser() {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!response.ok) {
        if (response.status === 409) {
          const data = await response.json().catch(() => ({}));
          setDialog(sessionErrorContent(data.message));
          setMessage("");
          return;
        }
        window.location.href = "/student/login";
        return;
      }
      const data = await response.json();
      if (data.user?.hasSubmitted) {
        setIsSubmitted(true);
        setMessage("You have already submitted this assessment. Thank you.");
        return;
      }

      if (isValidSavedAnswers(data.progress?.answers)) {
        setAnswers(data.progress.answers);
        if (Number.isInteger(data.progress.currentIndex)) {
          setCurrentIndex(Math.min(assessmentQuestions.length - 1, Math.max(0, data.progress.currentIndex)));
        } else {
          const firstPending = data.progress.answers.findIndex((answer) => !answer);
          setCurrentIndex(firstPending === -1 ? assessmentQuestions.length - 1 : firstPending);
        }
      }

      setUser(data.user);
      setMessage("");
      setIsProgressReady(true);
    }

    loadUser();
  }, []);

  useEffect(() => {
    if (!isProgressReady || isSubmitted) return;

    const timeout = window.setTimeout(async () => {
      const response = await fetch("/api/quiz/progress", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, currentIndex })
      });

      if (!response.ok && response.status !== 401) {
        const data = await response.json().catch(() => ({}));
        setDialog(sessionErrorContent(data.message));
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [answers, currentIndex, isProgressReady, isSubmitted]);

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

  function moveToQuestion(index) {
    setCurrentIndex(Math.min(assessmentQuestions.length - 1, Math.max(0, index)));
  }

  async function saveProgress(nextAnswers, nextIndex) {
    if (!isProgressReady || isSubmitted) return;

    const response = await fetch("/api/quiz/progress", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: nextAnswers, currentIndex: nextIndex })
    });

    if (!response.ok && response.status !== 401) {
      const data = await response.json().catch(() => ({}));
      setDialog(sessionErrorContent(data.message));
    }
  }

  function setAnswer(value, event) {
    event?.currentTarget?.blur();

    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = value;
    const nextIndex = currentIndex < assessmentQuestions.length - 1 ? currentIndex + 1 : currentIndex;

    setAnswers(nextAnswers);
    saveProgress(nextAnswers, nextIndex);

    if (currentIndex < assessmentQuestions.length - 1) {
      window.setTimeout(() => {
        moveToQuestion(nextIndex);
        questionCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 180);
    }
  }

  async function submitQuiz() {
    setIsSubmitting(true);
    setMessage("Submitting your answers...");
    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ answers })
    });
    const data = await response.json();
    setIsSubmitting(false);
    if (!response.ok) {
      if (response.status === 409) {
        setDialog(sessionErrorContent(data.message));
      }
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
              onClick={() => moveToQuestion(item.index)}
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

        <article className="question-card" ref={questionCardRef}>
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

          <div className="answer-grid" key={`question-${currentIndex}`}>
            {currentQuestion.options.map((option) => (
              <button
                key={`${currentIndex}-${option.value}`}
                className={currentAnswer === option.value ? "answer-card is-selected" : "answer-card"}
                onClick={(event) => setAnswer(option.value, event)}
              >
                <strong>{option.label}</strong>
              </button>
            ))}
          </div>

          <div className="quiz-actions">
            <button className="secondary-button quiz-nav-button" onClick={() => moveToQuestion(currentIndex - 1)} disabled={currentIndex === 0}>
              <ArrowLeft size={17} />
              Previous
            </button>
            {currentIndex < assessmentQuestions.length - 1 ? (
              <button className="primary-button" onClick={() => moveToQuestion(currentIndex + 1)}>
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

      {dialog && (
        <div className="modal-backdrop" role="presentation">
          <div className="error-dialog" role="alertdialog" aria-modal="true" aria-labelledby="quiz-session-error-title">
            <button className="dialog-close" type="button" onClick={() => setDialog(null)} aria-label="Close">
              <X size={18} weight="bold" />
            </button>
            <span className="dialog-icon">
              <WarningCircle size={28} weight="duotone" />
            </span>
            <h2 id="quiz-session-error-title">{dialog.title}</h2>
            <p>{dialog.message}</p>
            <button className="primary-button" type="button" onClick={logout}>
              Sign in again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
