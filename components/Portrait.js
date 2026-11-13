import { useState, useEffect } from "react";

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

  // Reset when the designer changes (dial navigation).
  useEffect(() => setImgOk(true), [slug]);

  return (
    <div className="portrait-circle">
      {imgOk ? (
        <img
          src={`/portraits/${slug}.svg`}
          alt={name}
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="portrait-fallback">{initials(name)}</span>
      )}
    </div>
  );
}
