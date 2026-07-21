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
        className="mt-12 border border-[#181818] px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
      >
        Continue
      </button>
    </>
  );
}
