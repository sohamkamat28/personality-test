import Link from "next/link";
import { InstagramLogo, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/data/site";

export default function Footer() {
  const whatsappMessage = encodeURIComponent("Hi! I have a question about Bean Theory Coffee.");

  return (
    <footer className="footer grain-section">
      <div className="footer__grid">
        <div>
          <p className="eyebrow">Specialty Coffee · Artisanal Bakes</p>
          <h2>Bean Theory Coffee</h2>
          <p>Made fresh. Made here. Made for you.</p>
          <p className="footer__copy">© 2025 Bean Theory Coffee. All rights reserved.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link href="/menu">Menu</Link>
          <Link href="/about">About Us</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/contact">Find Us</Link>
          <a href={site.swiggyUrl} target="_blank" rel="noreferrer">Order on Swiggy ↗</a>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={site.maps} target="_blank" rel="noreferrer"><MapPin size={18} /> {site.addressLine1}, Hiranandani Meadows</a>
          <a href={`tel:${site.phoneHref}`}><Phone size={18} /> {site.phone}</a>
          <a href={site.instagramUrl} target="_blank" rel="noreferrer"><InstagramLogo size={18} /> {site.instagram}</a>
          <a href={`https://wa.me/${site.phoneHref.replace("+", "")}?text=${whatsappMessage}`} target="_blank" rel="noreferrer"><WhatsappLogo size={18} /> WhatsApp the café</a>
        </div>
      </div>
      <p className="footer__fine">Built with love in Thane.</p>
    </footer>
  );
}
