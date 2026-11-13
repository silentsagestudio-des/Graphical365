// A one-shot handoff for the portrait's slide-in direction, set by DayDial
// right before it navigates to a new day and read by Portrait right after
// it mounts for that day. A plain module-level variable is enough here: in
// a Next.js client-side route change the JS module stays alive (no full
// page reload), so the value survives the trip between the two components
// without needing a query param or extra render prop plumbing.
let pendingDirection = null;

export function setPendingDirection(direction) {
  pendingDirection = direction;
}

export function consumePendingDirection() {
  const direction = pendingDirection;
  pendingDirection = null;
  return direction;
}
