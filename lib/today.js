const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// GRAPHICAL is a perpetual (month/day) calendar, not tied to a specific
// year, so "today" is matched on the visitor's local month + day only.
export function getTodaySlug(designers) {
  const now = new Date();
  const month = MONTH_NAMES[now.getMonth()];
  const day = now.getDate();
  const match = designers.find((d) => d.month === month && d.day === day);
  return (match || designers[0]).slug;
}
