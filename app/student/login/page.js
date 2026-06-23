"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LockKey, WarningCircle, X } from "@phosphor-icons/react";
import BrandLogo from "@/components/BrandLogo";

function signInErrorContent(status, fallback) {
  if (status === 403) {
    return {
      title: "Use your registered email",
      message: "This Google account is not registered for the assessment. Please sign in with the same email address you provided in the introduction Google Form."
    };
  }

  if (status === 409) {
    return {
      title: "Assessment already completed",
      message: "This account has already submitted the assessment. Each participant may complete it only once."
    };
  }

  if (status === 423) {
    return {
      title: "Already signed in elsewhere",
      message: "This account is currently active on another device. Please sign out there first, then continue the assessment from this device."
    };
  }

  return {
    title: "Sign-in could not be completed",
    message: fallback || "Please try again in a moment, or contact the administrator if the issue continues."
  };
}

export default function StudentLoginPage() {
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    window.handleGoogleCredential = async (response) => {
      setMessage("Checking your registration...");
      const result = await fetch("/api/auth/google", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await result.json();
      if (!result.ok) {
        setMessage("");
        setDialog(signInErrorContent(result.status, data.message));
        return;
      }

      await waitForStudentSession();
      window.location.assign(data.redirectTo);
    };

    const existingScript = document.querySelector("script[src='https://accounts.google.com/gsi/client']");
    const initialize = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: window.handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      window.google.accounts.id.renderButton(document.getElementById("googleButton"), {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "signin_with",
        logo_alignment: "left",
        width: 360
      });
      setIsReady(true);
    };

    if (existingScript) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.body.appendChild(script);
  }, [clientId]);

  async function waitForStudentSession() {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (response.ok) return;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  return (
    <div className="auth-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={17} />
        Home
      </Link>

      <section className="auth-card">
        <BrandLogo dark />
        <p className="eyebrow">Student access</p>
        <h1>Sign in with your registered Google email.</h1>
        <p>
          Please sign in using the email address you provided in the introduction Google Form. Each participant may attempt the assessment only once.
        </p>

        {clientId ? (
          <div className="google-zone">
            <div id="googleButton" />
            {!isReady && <small>Loading Google sign-in...</small>}
          </div>
        ) : (
          <div className="setup-note">
            <LockKey size={18} weight="bold" />
            Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to <code>.env.local</code> to enable Google sign-in.
          </div>
        )}

        {message && <p className="form-message">{message}</p>}
      </section>

      {dialog && (
        <div className="modal-backdrop" role="presentation">
          <div className="error-dialog" role="alertdialog" aria-modal="true" aria-labelledby="student-login-error-title">
            <button className="dialog-close" type="button" onClick={() => setDialog(null)} aria-label="Close">
              <X size={18} weight="bold" />
            </button>
            <span className="dialog-icon">
              <WarningCircle size={28} weight="duotone" />
            </span>
            <h2 id="student-login-error-title">{dialog.title}</h2>
            <p>{dialog.message}</p>
            <button className="primary-button" type="button" onClick={() => setDialog(null)}>
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
