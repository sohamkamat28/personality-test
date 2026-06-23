import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found grain-section">
      <div className="steam-cup" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h1>This page doesn&apos;t exist. (Neither does bad coffee here.)</h1>
      <p>Looks like you found a dead end. Let&apos;s get you back somewhere warm.</p>
      <div className="button-row">
        <Link className="btn btn--crema" href="/">Take Me Home</Link>
        <Link className="btn btn--glass" href="/menu">See the Menu</Link>
      </div>
    </section>
  );
}
