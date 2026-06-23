"use client";

import { useEffect, useMemo, useState } from "react";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { gallery } from "@/data/site";

const filters = ["All", "Coffee", "Food & Bakes", "Interiors", "People"];

export default function GalleryGrid({ preview = false }) {
  const [active, setActive] = useState("All");
  const [visible, setVisible] = useState(preview ? 6 : 12);
  const [lightbox, setLightbox] = useState(null);
  const photos = useMemo(() => gallery.filter((item) => active === "All" || item.category === active), [active]);
  const visiblePhotos = photos.slice(0, visible);

  const move = (direction) => {
    const current = photos.findIndex((item) => item.id === lightbox.id);
    setLightbox(photos[(current + direction + photos.length) % photos.length]);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, photos]);

  return (
    <>
      {!preview && (
        <div className="filter-tabs" role="tablist" aria-label="Gallery filters">
          {filters.map((filter) => (
            <button key={filter} className={active === filter ? "is-active" : ""} onClick={() => { setActive(filter); setVisible(12); }} role="tab" aria-selected={active === filter}>
              {filter}
            </button>
          ))}
        </div>
      )}
      <div className="gallery-grid">
        {visiblePhotos.map((photo, index) => (
          <button className="gallery-tile" key={photo.id} onClick={() => setLightbox(photo)} style={{ "--span": index % 5 === 0 ? 2 : 1 }}>
            <img src={photo.src} alt={photo.caption} loading="lazy" />
            <span>{photo.caption}</span>
          </button>
        ))}
      </div>
      {visible < photos.length && (
        <button className="btn btn--outline load-more" onClick={() => setVisible(photos.length)}>
          Load More
        </button>
      )}
      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.caption}>
          <button aria-label="Close gallery" onClick={() => setLightbox(null)}><X size={28} /></button>
          <button aria-label="Previous photo" onClick={() => move(-1)}><CaretLeft size={32} /></button>
          <figure>
            <img src={lightbox.src} alt={lightbox.caption} />
            <figcaption>{lightbox.caption}</figcaption>
          </figure>
          <button aria-label="Next photo" onClick={() => move(1)}><CaretRight size={32} /></button>
        </div>
      )}
    </>
  );
}
