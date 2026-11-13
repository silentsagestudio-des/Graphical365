// Per-month theme: "Main Background" (the page background, active badge
// label color, month-pill, pill-button hover) and "darker shade" (the
// GRAPHICAL watermark mark on the side, and the unhighlighted/inactive
// category badges). Pairs repeat on a 6-month cycle (Jan/Jul, Feb/Aug,
// Mar/Sep, Apr/Oct, May/Nov, Jun/Dec), matching the actual portrait
// illustration outline colors for each month pair.
export const MONTH_COLORS = {
  January: { pink: "#018f47", badgeOutline: "#007138" },
  February: { pink: "#2ebcec", badgeOutline: "#1097c4" },
  March: { pink: "#846a20", badgeOutline: "#604909" },
  April: { pink: "#3030b2", badgeOutline: "#4747d0" },
  May: { pink: "#8865db", badgeOutline: "#723eed" },
  June: { pink: "#006873", badgeOutline: "#007581" },
  July: { pink: "#018f47", badgeOutline: "#007138" },
  August: { pink: "#2ebcec", badgeOutline: "#1097c4" },
  September: { pink: "#846a20", badgeOutline: "#604909" },
  October: { pink: "#3030b2", badgeOutline: "#4747d0" },
  November: { pink: "#8865db", badgeOutline: "#723eed" },
  December: { pink: "#006873", badgeOutline: "#007581" },
};

export function getMonthTheme(month) {
  return MONTH_COLORS[month] || { pink: "#f65ab0", badgeOutline: "#de007a" };
}
