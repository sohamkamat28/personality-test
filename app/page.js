import Link from "next/link";
import { ArrowRight, LockKey, Student, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import BrandLogo from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link href="/" aria-label="Personality test home">
          <BrandLogo />
        </Link>
        <span className="security-pill">
          <LockKey size={15} weight="bold" />
          Invite only
        </span>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <BrandLogo compact />
          <p className="eyebrow">Personality test</p>
          <h1>Know your personality with greater clarity.<br />Approach life with more certainty.</h1>
          <p>
            In about 20 minutes, you&apos;ll gain a deeper understanding of your personality. Complete the assessment with your full attention and choose the responses that best describe you. There are no right or wrong answers - only the honest ones.
          </p>
        </div>

        <div className="entry-panel" aria-label="Sign in options">
          <Link href="/student/login" className="entry-card">
            <span className="entry-icon">
              <Student size={24} weight="duotone" />
            </span>
            <span>
              <strong>Sign in as student</strong>
              <small>Use your registered Google email to begin.</small>
            </span>
            <ArrowRight size={19} weight="bold" />
          </Link>

          <Link href="/admin/login" className="entry-card entry-card--quiet">
            <span className="entry-icon">
              <ShieldCheck size={24} weight="duotone" />
            </span>
            <span>
              <strong>Admin login</strong>
              <small>Register students and view submissions.</small>
            </span>
            <ArrowRight size={19} weight="bold" />
          </Link>
        </div>
      </section>
    </div>
  );
}
