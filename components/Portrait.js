import { useState, useEffect } from "react";
import { growPortrait, REVEAL_DELAY_MS } from "../lib/portraitMask";

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

  // Reset when the designer changes (dial navigation), then release the
  // shrink/pulse mask DayDial applied before this navigation -- after a
  // brief pause at minimum size, so the swap doesn't flash into view mid-
  // shrink. Harmless (and necessary) on a plain/direct load too, since the
  // mask starts un-shrunk there and this just confirms that state.
  useEffect(() => {
    setImgOk(true);
    const timer = window.setTimeout(growPortrait, REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [slug]);

  return (
    <div className="portrait-circle" id="portraitCircle">
      <div className="portrait-pulse-wrap" id="portraitPulseWrap">
        {imgOk ? (
          <img
            key={slug}
            src={`/portraits/${slug}.svg`}
            alt={name}
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="portrait-fallback">{initials(name)}</span>
        )}
      </div>
    </div>
  );
}
