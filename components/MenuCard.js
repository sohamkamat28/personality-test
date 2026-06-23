export default function MenuCard({ item, image }) {
  return (
    <article className="menu-card">
      {image && <img src={image} alt={`${item.name} at Bean Theory Coffee`} loading="lazy" />}
      <div className="menu-card__body">
        <div className="menu-card__tags">
          <span className="tag">{item.categoryLabel || item.category}</span>
          {item.featured && <span className="ribbon">Regulars' pick</span>}
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card__meta">
          <span>{item.group}</span>
          <strong>{item.price}</strong>
        </div>
      </div>
    </article>
  );
}
