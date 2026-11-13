import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { getTodaySlug } from "../lib/today";
import { setPendingDirection } from "../lib/navDirection";

const DAYS_IN_MONTH_BY_NAME = {
  January: 31,
  February: 28,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};
const RADIUS_FRACTION = 0.8;
const MARKER_RADIUS_FRACTION = 0.95;
const SPIN_MS = 750;

// Every day's spoke sits at a fixed angle around the ring, independent of
// which day is "current" — the ring itself rotates to bring the right spoke
// to the top, instead of every number's position being recomputed each time.
// `daysInMonth` varies per month, so the step size is passed in rather than
// baked into a module-level constant.
function fixedAngle(day, daysInMonth) {
  return (day - 1) * (360 / daysInMonth);
}

function radialPosition(angleDeg, radiusFraction) {
  const theta = (angleDeg * Math.PI) / 180;
  const x = 50 + radiusFraction * Math.sin(theta) * 50;
  const y = 50 - radiusFraction * Math.cos(theta) * 50;
  return { x, y };
}

// Shortest signed angular path from `from` to `to` (mod 360), clamped to
// (-180, 180] — so e.g. day 31 -> day 1 spins forward ~11.6deg instead of
// the long way around.
function shortestDelta(from, to) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export default function DayDial({ designers, current }) {
  const router = useRouter();

  // The ring only ever shows the current day's own month: its day count
  // and which slug fills each spoke both depend on which month is active.
  const monthDays = DAYS_IN_MONTH_BY_NAME[current.month] || 31;
  const monthDesigners = designers.filter((d) => d.month === current.month);

  // The ring needs to rotate so that the current day's fixed spoke lands at
  // the top (0deg) marker, hence the negation.
  const [displayDay, setDisplayDay] = useState(current.day);
  const [rotation, setRotation] = useState(-fixedAngle(current.day, monthDays));

  // Tracks an in-flight spin so (a) a second click can't interrupt it and
  // (b) the sync effect below can tell "we just animated this" apart from
  // an external navigation (back/forward) that should snap, not spin.
  const animatingRef = useRef(false);

  // Touch/drag-to-rotate: dialRef measures the circle's center so a pointer
  // position can be turned into an angle; dragRef holds the in-progress
  // gesture's state (not React state, since it updates every pointermove
  // and shouldn't trigger its own re-renders); isDragging only toggles the
  // CSS transition off/on so the ring follows the finger with zero lag
  // while dragging, then eases back on for the post-release snap.
  const dialRef = useRef(null);
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!animatingRef.current) {
      setDisplayDay(current.day);
      setRotation((prev) => {
        const targetMod =
          ((-fixedAngle(current.day, monthDays)) % 360 + 360) % 360;
        const prevMod = ((prev % 360) + 360) % 360;
        return prev + shortestDelta(prevMod, targetMod);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.day, current.month]);

  const spinTo = (targetDay, slug) => {
    if (animatingRef.current) return;

    if (targetDay === displayDay) {
      if (slug && slug !== current.slug) router.push(`/day/${slug}`);
      return;
    }

    // The portrait's slide-in direction depends on which side of the dial
    // the clicked day is sitting on right now (before the ring starts
    // moving): a day on the left slides the new portrait in right-to-left,
    // a day on the right slides it in left-to-right.
    if (slug) {
      const effectiveAngle =
        ((fixedAngle(targetDay, monthDays) + rotation) % 360 + 360) % 360;
      const isLeftSide = effectiveAngle > 180;
      setPendingDirection(isLeftSide ? "fromRight" : "fromLeft");
    }

    animatingRef.current = true;
    setDisplayDay(targetDay);
    setRotation((prev) => {
      const targetMod = ((-fixedAngle(targetDay, monthDays)) % 360 + 360) % 360;
      const prevMod = ((prev % 360) + 360) % 360;
      return prev + shortestDelta(prevMod, targetMod);
    });

    window.setTimeout(() => {
      animatingRef.current = false;
      if (slug) router.push(`/day/${slug}`);
    }, SPIN_MS);
  };

  // Degrees of pointer movement, from the dial's center, before a touch/
  // click counts as a drag rather than a tap -- small enough to feel
  // immediate, large enough that a normal tap on a number never misfires
  // as a drag.
  const DRAG_THRESHOLD_DEG = 3;

  // Angle (0 = straight up, clockwise-positive) of a pointer event relative
  // to the dial's own center -- same convention as radialPosition/
  // fixedAngle above, so it composes directly with `rotation`.
  const angleFromEvent = (e) => {
    const rect = dialRef.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  };

  // Given wherever the ring is currently sitting, which day's spoke is
  // closest to the top marker right now.
  const nearestDayAndSlug = (currentRotation) => {
    let bestDay = displayDay;
    let bestDist = Infinity;
    for (let day = 1; day <= monthDays; day++) {
      const effectiveAngle =
        ((fixedAngle(day, monthDays) + currentRotation) % 360 + 360) % 360;
      const dist = Math.min(effectiveAngle, 360 - effectiveAngle);
      if (dist < bestDist) {
        bestDist = dist;
        bestDay = day;
      }
    }
    const match = monthDesigners.find((d) => d.day === bestDay);
    return { day: bestDay, slug: match ? match.slug : null };
  };

  const handlePointerDown = (e) => {
    if (animatingRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Dragging only rotates the ring -- the Today link and month dropdown
    // in the center keep their normal tap/click behavior untouched.
    if (e.target.closest(".dial-center")) return;

    dragRef.current = {
      pointerId: e.pointerId,
      lastAngle: angleFromEvent(e),
      traveled: 0,
      moved: false,
      // The drag's own running rotation value, seeded from the real state
      // at gesture start and updated synchronously on every move -- reading
      // it back at release is then just a plain variable read, with no
      // dependency on React's render/effect timing.
      rotation,
    };
    dialRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const angle = angleFromEvent(e);
    const delta = shortestDelta(drag.lastAngle, angle);
    drag.lastAngle = angle;
    if (delta === 0) return;

    if (!drag.moved) {
      drag.traveled += Math.abs(delta);
      if (drag.traveled < DRAG_THRESHOLD_DEG) return;
      drag.moved = true;
      setIsDragging(true);
    }

    e.preventDefault();
    drag.rotation += delta;
    setRotation(drag.rotation);
  };

  const finishDrag = (e) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (!drag.moved) return; // was just a tap -- let the normal click fire

    e.preventDefault();
    setIsDragging(false);

    const { day: targetDay, slug } = nearestDayAndSlug(drag.rotation);

    if (targetDay === displayDay) {
      // Already resting on the right day -- just settle any sub-degree
      // drift from the live drag back to a perfectly centered angle.
      const targetMod = ((-fixedAngle(targetDay, monthDays)) % 360 + 360) % 360;
      const prevMod = ((drag.rotation % 360) + 360) % 360;
      setRotation(drag.rotation + shortestDelta(prevMod, targetMod));
      if (slug && slug !== current.slug) router.push(`/day/${slug}`);
      return;
    }

    // Hand off to the same spin used for a tap -- same slide-direction and
    // delayed-navigation logic, just a shorter distance left to travel.
    spinTo(targetDay, slug);
  };

  // Browser-initiated interruptions (e.g. an edge-swipe gesture stealing the
  // pointer) still need to resolve the drag instead of leaving the ring
  // stuck mid-rotation.
  const handlePointerCancel = (e) => finishDrag(e);

  const handleToday = () => {
    const todaySlug = getTodaySlug(designers);
    const today = designers.find((d) => d.slug === todaySlug);
    if (!today) return;

    if (today.month === current.month) {
      spinTo(today.day, today.slug);
    } else if (today.slug !== current.slug) {
      router.push(`/day/${today.slug}`);
    }
  };

  // Jumping to a different month swaps the whole ring (different day count,
  // different set of designers), so it's a plain navigation rather than a
  // same-ring spin — lands on day 1 of the chosen month.
  const handleMonthChange = (monthName) => {
    if (monthName === current.month) return;
    const target =
      designers.find((d) => d.month === monthName && d.day === 1) ||
      designers.find((d) => d.month === monthName);
    if (target && target.slug !== current.slug) {
      router.push(`/day/${target.slug}`);
    }
  };

  const days = Array.from({ length: monthDays }, (_, i) => i + 1);
  const marker = radialPosition(0, MARKER_RADIUS_FRACTION);
  const displayed =
    monthDesigners.find((d) => d.day === displayDay) || current;

  return (
    <div className="dial-wrap">
      <div
        className="dial"
        ref={dialRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="dial-marker"
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
        />

        <div
          className={`dial-scroll${isDragging ? " dragging" : ""}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {days.map((dayNum) => {
            const isCurrent = dayNum === displayDay;
            const angle = fixedAngle(dayNum, monthDays);
            const { x, y } = radialPosition(angle, RADIUS_FRACTION);
            const posStyle = {
              "--x": `${x}%`,
              "--y": `${y}%`,
              "--rot": `${angle}deg`,
            };
            const match = monthDesigners.find((d) => d.day === dayNum);
            const label = String(dayNum).padStart(2, "0");

            if (isCurrent) {
              return (
                <span
                  key="current"
                  className="dial-day current"
                  style={posStyle}
                >
                  {label}
                </span>
              );
            }
            if (match) {
              return (
                <button
                  key={match.slug}
                  type="button"
                  className="dial-day"
                  style={posStyle}
                  onClick={() => spinTo(match.day, match.slug)}
                >
                  {label}
                </button>
              );
            }
            return (
              <button
                key={`ghost-${dayNum}`}
                type="button"
                className="dial-day"
                style={posStyle}
                disabled
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="dial-center">
          <button type="button" className="today-link" onClick={handleToday}>
            Today
          </button>
          <div className="month-pill-wrap">
            <select
              className="month-pill"
              value={displayed.month}
              onChange={(e) => handleMonthChange(e.target.value)}
              aria-label="Jump to month"
            >
              {Object.keys(DAYS_IN_MONTH_BY_NAME).map((monthName) => (
                <option key={monthName} value={monthName}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
