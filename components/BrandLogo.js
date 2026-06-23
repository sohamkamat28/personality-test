export default function BrandLogo({ compact = false, dark = false, subtitle = "Private assessment portal" }) {
  return (
    <span className={dark ? "brand-lockup brand-lockup--dark" : "brand-lockup"}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <circle cx="24" cy="24" r="21" />
          <path d="M29.4 14.8c-7.4 0-13.4 5.8-13.4 13 0 1.9.4 3.7 1.2 5.3 2.4-3.8 6.4-6.2 11-6.2h3.8c-1.9 3.7-5.6 6.1-9.9 6.1h-3.5c2.5 3.3 6.4 5.4 10.8 5.4 7.5 0 13.6-5.3 13.6-11.8S36.9 14.8 29.4 14.8Z" />
          <path d="M8.2 25.4c3.4-7.2 9.1-11.9 16.3-13.4" />
        </svg>
      </span>
      {!compact && (
        <span>
          <strong>Personality test</strong>
          {subtitle && <small>{subtitle}</small>}
        </span>
      )}
    </span>
  );
}
