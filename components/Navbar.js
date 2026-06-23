"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { site } from "@/data/site";

const links = [
  ["Menu", "/menu"],
  ["About", "/about"],
  ["Gallery", "/gallery"],
  ["Find Us", "/contact"]
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`navbar ${scrolled || open ? "navbar--solid" : ""}`}>
      <Link href="/" className="brand" aria-label="Bean Theory Coffee homepage" onClick={() => setOpen(false)}>
        <span className="brand__mark">BT</span>
        <span>
          <strong>{site.name}</strong>
          <small>Specialty Coffee · Thane</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        {links.map(([label, href]) => (
          <Link key={label} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <a className="btn btn--small btn--ghost" href={site.swiggyUrl} target="_blank" rel="noreferrer">
          Order on Swiggy ↗
        </a>
        <Link className="btn btn--small btn--crema" href="/contact">
          Visit Us
        </Link>
      </div>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
        {open ? <X size={28} /> : <List size={28} />}
      </button>
      <div className={`mobile-menu ${open ? "is-open" : ""}`}>
        {links.map(([label, href], index) => (
          <Link key={label} href={href} style={{ "--i": index }} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        <a href={site.swiggyUrl} target="_blank" rel="noreferrer" className="btn btn--ghost" onClick={() => setOpen(false)}>
          Order on Swiggy ↗
        </a>
        <Link href="/contact" className="btn btn--crema" onClick={() => setOpen(false)}>
          Visit Us
        </Link>
      </div>
    </header>
  );
}
