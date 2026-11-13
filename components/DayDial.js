import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { getTodaySlug } from "../lib/today";

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

  const days = Array.from({ length: monthDays }, (_, i) => i + 1);
  const marker = radialPosition(0, MARKER_RADIUS_FRACTION);
  const displayed =
    monthDesigners.find((d) => d.day === displayDay) || current;

  return (
    <div className="dial-wrap">
      <div className="dial">
        <div
          className="dial-marker"
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
        />

        <div
          className="dial-scroll"
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
          <div className="month-pill">{displayed.month}</div>
        </div>
      </div>
    </div>
  );
}
