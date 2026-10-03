export const RSVP_DEADLINE = "17 October 2026";
export const RSVP_DEADLINE_SHORT = "17 October";
export const RSVP_CLOSE_AT = "2026-10-18T00:00:00+01:00";

export function isRsvpClosed(at = new Date()) {
  return at >= new Date(RSVP_CLOSE_AT);
}
