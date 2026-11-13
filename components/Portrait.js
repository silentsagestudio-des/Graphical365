import { useState, useEffect } from "react";
import { consumePendingDirection } from "../lib/navDirection";

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Portrait({ slug, name }) {
  const [imgOk, setImgOk] = useState(true);
  const [slideClass, setSlideClass] = useState("");

  // Reset when the designer changes (dial navigation), and pick up whatever
  // slide direction DayDial queued right before this navigation (none, if
  // we got here some other way, e.g. the month dropdown or a direct link).
  useEffect(() => {
    setImgOk(true);
    const direction = consumePendingDirection();
    setSlideClass(
      direction === "fromRight"
        ? "slide-from-right"
        : direction === "fromLeft"
        ? "slide-from-left"
        : ""
    );
  }, [slug]);

  return (
    <div className="portrait-circle">
      {imgOk ? (
        <img
          key={slug}
          className={slideClass}
          src={`/portraits/${slug}.svg`}
          alt={name}
          onError={() => setImgOk(false)}
          onAnimationEnd={() => setSlideClass("")}
        />
      ) : (
        <span className="portrait-fallback">{initials(name)}</span>
      )}
    </div>
  );
}
