export const RSVP_DEADLINE = "17 October 2026";
export const RSVP_DEADLINE_SHORT = "17 October";
export const RSVP_CLOSE_AT = "2026-10-18T00:00:00+01:00";
export const FINAL_WEEK_START_AT = "2026-12-12T00:00:00Z";
export const PHOTO_FOCUS_START_AT = "2026-12-19T13:00:00Z";
export const WEDDING_DAY_END_AT = "2026-12-20T00:00:00Z";

export type WeddingPhase =
  | "normal"
  | "rsvp-closed"
  | "final-week"
  | "wedding-day"
  | "after";

export function isRsvpClosed(at = new Date()) {
  return at >= new Date(RSVP_CLOSE_AT);
}

export function getWeddingPhase(at = new Date()): WeddingPhase {
  if (at >= new Date(WEDDING_DAY_END_AT)) return "after";
  if (at >= new Date(PHOTO_FOCUS_START_AT)) return "wedding-day";
  if (at >= new Date(FINAL_WEEK_START_AT)) return "final-week";
  if (isRsvpClosed(at)) return "rsvp-closed";
  return "normal";
}
