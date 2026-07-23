import type { FormEvent } from "react";

type LookupStepProps = {
  name: string;
  error: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
};

export default function LookupStep({
  name,
  error,
  isLoading,
  onNameChange,
  onSubmit,
  onBack,
}: LookupStepProps) {
  return (
    <>
      <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
        Find Your Invitation
      </p>

      <h1 className="font-serif text-5xl leading-none md:text-7xl">
        Your Details
      </h1>

      <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
        Please enter the name exactly as it appears on your wedding invitation.
      </p>

      <form onSubmit={onSubmit} className="mt-12 w-full max-w-md">
        <label htmlFor="guest-name" className="sr-only">
          Name on invitation
        </label>

        <input
          id="guest-name"
          name="guest-name"
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Benjamin Humphrey"
          autoComplete="name"
          disabled={isLoading}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "guest-name-error" : undefined}
          className="rsvp-control w-full border border-[#e6e2da] bg-white/20 px-5 py-4 text-center font-serif text-lg outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {error && (
          <p
            id="guest-name-error"
            role="alert"
            className="mt-4 text-sm leading-6 text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="rsvp-action mt-5 w-full rounded-full border border-[#A97A3D] bg-[#A97A3D] px-6 py-4 text-xs uppercase tracking-[0.3em] text-white hover:bg-transparent hover:text-[#A97A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A97A3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Finding Invitation..." : "Find My Invitation"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="mt-6 text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D] disabled:opacity-50"
        >
          Back
        </button>
      </form>
    </>
  );
}
