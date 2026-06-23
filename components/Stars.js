export default function Stars({ rating = 5 }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? "is-filled" : ""}>★</span>
      ))}
    </span>
  );
}
