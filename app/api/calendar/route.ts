function foldCalendarLine(line: string) {
  const parts = line.match(/.{1,73}/g) ?? [line];
  return parts.join("\r\n ");
}

type InvitationType = "day" | "evening";

const calendarDetails: Record<
  InvitationType,
  {
    uid: string;
    start: string;
    summary: string;
    location: string;
    description: string;
    filename: string;
  }
> = {
  day: {
    uid: "20261219-wedding-day@humphreywedding.co.uk",
    start: "20261219T120000Z",
    summary: "Benjamin & Chloe's Wedding",
    location: "St Andrew's Church\\, Longton\\, Lancashire",
    description:
      "Day invitation: arrive at St Andrew's Church from 12:00pm for the 12:30pm ceremony\\, followed by the reception and wedding breakfast at Longridge House. Full details: https://www.humphreywedding.co.uk",
    filename: "benjamin-and-chloe-day-invitation.ics",
  },
  evening: {
    uid: "20261219-wedding-evening@humphreywedding.co.uk",
    start: "20261219T190000Z",
    summary: "Benjamin & Chloe's Evening Celebration",
    location:
      "Longridge House\\, Chipping Lane\\, Thornley\\, Preston PR3 2TB",
    description:
      "Evening invitation: join us at Longridge House from 7:00pm for music\\, drinks and dancing. You are also very welcome to attend the optional church ceremony at St Andrew's Church at 12:30pm\\, with arrival from 12:00pm. Full details: https://www.humphreywedding.co.uk",
    filename: "benjamin-and-chloe-evening-invitation.ics",
  },
};

function buildCalendar(invitationType: InvitationType) {
  const details = calendarDetails[invitationType];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Benjamin and Chloe//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${details.uid}`,
    "DTSTAMP:20260805T000000Z",
    `DTSTART:${details.start}`,
    "DTEND:20261220T000000Z",
    `SUMMARY:${details.summary}`,
    `LOCATION:${details.location}`,
    `DESCRIPTION:${details.description}`,
    "URL:https://www.humphreywedding.co.uk",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(foldCalendarLine)
    .join("\r\n");
}

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const invitationType: InvitationType =
    new URL(request.url).searchParams.get("type") === "evening"
      ? "evening"
      : "day";
  const details = calendarDetails[invitationType];

  return new Response(buildCalendar(invitationType), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${details.filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
