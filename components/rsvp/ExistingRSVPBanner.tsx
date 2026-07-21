type ExistingRSVPBannerProps = {
  submittedAt: string;
};

function formatSubmissionDate(dateValue: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateValue));
}

export default function ExistingRSVPBanner({
  submittedAt,
}: ExistingRSVPBannerProps) {
  return (
    <div className="mt-8 w-full border border-[#c9b58f] bg-[#f3eee4] px-6 py-6 text-center">
      <p className="font-serif text-xl">
        We&apos;ve already received your RSVP
      </p>

      <p className="mt-3 text-sm leading-7 text-neutral-600">
        Submitted on{" "}
        <span className="font-medium text-[#181818]">
          {formatSubmissionDate(submittedAt)}
        </span>
        .
      </p>

      <p className="mt-2 text-sm leading-7 text-neutral-600">
        If your plans have changed, you&apos;re welcome to update your
        response below.
      </p>
    </div>
  );
}
