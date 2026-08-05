function foldCalendarLine(line: string) {
  const parts = line.match(/.{1,73}/g) ?? [line];
  return parts.join("\r\n ");
}

const calendar = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Benjamin and Chloe//Wedding//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "BEGIN:VEVENT",
  "UID:20261219-wedding@humphreywedding.co.uk",
  "DTSTAMP:20260805T000000Z",
  "DTSTART:20261219T120000Z",
  "DTEND:20261220T000000Z",
  "SUMMARY:Benjamin & Chloe's Wedding",
  "LOCATION:St Andrew's Church\\, Longton\\, Lancashire",
  "DESCRIPTION:Guests arrive from 12:00pm. Ceremony at St Andrew's Church at 12:30pm\\, followed by the reception at Longridge House\\, Chipping Lane\\, Thornley\\, Preston PR3 2TB. Full details: https://humphreywedding.co.uk",
  "URL:https://humphreywedding.co.uk",
  "STATUS:CONFIRMED",
  "END:VEVENT",
  "END:VCALENDAR",
].map(foldCalendarLine).join("\r\n");

export const dynamic = "force-static";

export function GET() {
  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="benjamin-and-chloe-wedding.ics"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
