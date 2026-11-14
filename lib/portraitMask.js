// Direct DOM toggles for the portrait "mask" transition: shrinking the
// portrait circle down to a small pulsing dot while the day underneath
// changes (drag-hold, a tap, the Today button, or a month jump), then
// growing it back to reveal the new portrait. DayDial calls shrinkPortrait()
// right before it changes/navigates; Portrait calls growPortrait() once it
// has mounted with the new slug.
//
// Plain DOM access (not React state) is used here on purpose: DayDial's
// drag handling is already imperative (refs, not state, for perf), and
// going through React state/props to reach a sibling component for a
// purely visual effect would add render-cycle lag the gesture can't afford.
// This mirrors the standalone demo's verified implementation exactly.
//
// The outer #portraitCircle only ever uses a CSS `transition` for its
// shrink/grow `transform`; the inner #portraitPulseWrap owns the separate
// looping pulse `animation`. See styles/globals.css for why that split
// avoids a sudden/snapping grow-back.

export const SHRINK_MS = 260; // matches .portrait-circle's transform transition
export const REVEAL_DELAY_MS = 90; // brief pause at minimum size after the swap, before growing back

function getCircle() {
  return typeof document !== "undefined"
    ? document.getElementById("portraitCircle")
    : null;
}

function getPulseWrap() {
  return typeof document !== "undefined"
    ? document.getElementById("portraitPulseWrap")
    : null;
}

export function shrinkPortrait() {
  const circle = getCircle();
  const pulseWrap = getPulseWrap();
  if (!circle || !pulseWrap) return;
  if (circle.classList.contains("portrait-shrink")) return; // already held/shrunk

  pulseWrap.classList.remove("pulsing");
  circle.classList.add("portrait-shrink");
  window.setTimeout(() => {
    if (circle.classList.contains("portrait-shrink")) {
      pulseWrap.classList.add("pulsing");
    }
  }, SHRINK_MS);
}

export function growPortrait() {
  const circle = getCircle();
  const pulseWrap = getPulseWrap();
  if (!circle || !pulseWrap) return;
  pulseWrap.classList.remove("pulsing");
  circle.classList.remove("portrait-shrink");
}
