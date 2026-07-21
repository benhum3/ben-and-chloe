type ThankYouStepProps = {
  nobodyAttending: boolean;
  wasUpdate: boolean;
};

export default function ThankYouStep({
  nobodyAttending,
  wasUpdate,
}: ThankYouStepProps) {
  let message: string;

  if (wasUpdate) {
    message = nobodyAttending
      ? "Your updated response has been received. We’re sorry you won’t be able to join us."
      : "Your updated response has been received. We can’t wait to celebrate with you.";
  } else {
    message = nobodyAttending
      ? "Thank you for letting us know. We’re sorry you won’t be able to join us."
      : "Thank you for taking the time to respond. We can’t wait to celebrate with you.";
  }

  return (
    <>
      <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
        Thank You
      </p>

      <h1 className="font-serif text-5xl leading-none md:text-7xl">
        Response Received
      </h1>

      <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
        {message}
      </p>

      <p className="mt-10 font-serif text-3xl">
        Benjamin &amp; Chloe
      </p>
    </>
  );
}
