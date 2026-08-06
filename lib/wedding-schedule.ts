export const RSVP_CLOSE_AT = "2026-10-01T00:00:00+01:00";

export function isRsvpClosed(at = new Date()) {
  return at >= new Date(RSVP_CLOSE_AT);
}
