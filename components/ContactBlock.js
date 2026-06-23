"use client";

import { useState } from "react";
import { InstagramLogo, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { site } from "@/data/site";

export default function ContactBlock({ form = false }) {
  const [status, setStatus] = useState("idle");
  const whatsappMessage = encodeURIComponent("Hi! I have a question about Bean Theory Coffee.");

  const onSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const validPhone = /^[+]?[\d\s\-()]{10,15}$/.test(phone);

    if (name.length < 2 || !validPhone || message.length < 10 || message.length > 500) {
      setStatus("error");
      return;
    }

    setStatus("success");
    event.currentTarget.reset();
  };

  return (
    <section className="section contact-section" id="find-us">
      <div className="section-heading">
        <p className="eyebrow">Find Us</p>
        <h1>We're in the Emerald Plaza. Come find us.</h1>
        <p>You'll smell the espresso before you see Shop 12. Open daily for pour-overs, croissants, Wi-Fi, and no-rush tables.</p>
      </div>
      <div className="contact-grid">
        <div className="map-wrap">
          <iframe title="Map to Bean Theory Coffee at Emerald Plaza, Hiranandani Meadows" src={site.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <div className="contact-card">
          <h2>Bean Theory Coffee</h2>
          <p><MapPin size={22} /> <span>{site.addressLine1}<br />{site.addressLine2}<br />{site.addressLine3}</span></p>
          <p><Phone size={22} /> <a href={`tel:${site.phoneHref}`}>{site.phone}</a></p>
          <p><InstagramLogo size={22} /> <a href={site.instagramUrl} target="_blank" rel="noreferrer">{site.instagram}</a></p>
          <div className="hours">
            {site.hours.map(([day, time]) => (
              <div key={day}><span>{day}</span><strong>{time}</strong></div>
            ))}
            <em>{site.lastOrders}</em>
          </div>
          <div className="button-row button-row--stacked">
            <a className="btn btn--crema" href={site.maps} target="_blank" rel="noreferrer">Open in Google Maps →</a>
            <a className="btn btn--whatsapp" href={`https://wa.me/${site.phoneHref.replace("+", "")}?text=${whatsappMessage}`} target="_blank" rel="noreferrer"><WhatsappLogo size={19} weight="fill" /> WhatsApp Us</a>
            <a className="btn btn--outline" href={`tel:${site.phoneHref}`}>Call {site.phone}</a>
          </div>
        </div>
        {form && (
          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <h2>Event enquiry or feedback? Write to us.</h2>
            <label htmlFor="name">Your Name<input id="name" name="name" required placeholder="e.g. Priya Sharma" /></label>
            <label htmlFor="phone">Phone Number<input id="phone" name="phone" type="tel" required placeholder="+91 98765 43210" /></label>
            <label className="contact-form__wide" htmlFor="message">Your Message<textarea id="message" name="message" rows="5" maxLength="500" required placeholder="Tell us what's on your mind - a question, feedback, or event inquiry." /></label>
            {status === "success" && <p className="form-state form-state--success">Thanks! We'll get back to you within 24 hours. In the meantime, come say hi in person.</p>}
            {status === "error" && <p className="form-state form-state--error">Something went wrong. Please check your name, phone, and message, or WhatsApp us directly.</p>}
            <button className="btn btn--crema" type="submit">Send Message →</button>
          </form>
        )}
      </div>
    </section>
  );
}
