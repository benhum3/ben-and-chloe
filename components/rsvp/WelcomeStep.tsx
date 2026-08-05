type WelcomeStepProps = {
  onContinue: () => void;
};

export default function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <>
      <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
        Kindly Respond
      </p>

      <h1 className="font-serif text-5xl leading-none md:text-7xl">
        You&apos;re Invited
      </h1>

      <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
        We are delighted to invite you to celebrate our wedding. When
        you&apos;re ready, please continue below.
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="rsvp-action mt-12 rounded-full border border-[#d2a641] bg-[#d2a641] px-9 py-4 text-xs uppercase tracking-[0.3em] text-[#181818] hover:bg-transparent hover:text-[var(--gold-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2a641] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f2]"
      >
        Continue
      </button>
    </>
  );
}
