import Stars from "@/components/Stars";

export default function ReviewCard({ review }) {
  return (
    <article className="review-card" aria-label={`Review by ${review.name}`}>
      <span className="quote-mark">"</span>
      <Stars rating={review.rating} />
      <p>{review.text}</p>
      <div className="review-card__foot">
        <strong>{review.name}</strong>
        {review.source && <span>{review.source}</span>}
      </div>
    </article>
  );
}
