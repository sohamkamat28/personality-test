"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react";
import BrandLogo from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Checking credentials...");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.message || "Login failed.");
      return;
    }

    await waitForAdminSession();
    window.location.assign(data.redirectTo);
  }

  async function waitForAdminSession() {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await fetch("/api/admin/students", {
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

      <form className="auth-card" onSubmit={handleSubmit}>
        <BrandLogo dark />
        <span className="auth-icon">
          <ShieldCheck size={30} weight="duotone" />
        </span>
        <p className="eyebrow">Admin portal</p>
        <h1>Manage access and review submissions.</h1>
        <p>Use the admin credentials configured on your system.</p>

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
        </label>

        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}
