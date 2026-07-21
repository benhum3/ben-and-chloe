import type { FormEvent } from "react";

type LookupStepProps = {
  name: string;
  error: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LookupStep({
  name,
  error,
  isLoading,
  onNameChange,
  onSubmit,
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
          className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-center font-serif text-lg outline-none transition placeholder:text-neutral-400 focus:border-[#A97A3D] disabled:cursor-not-allowed disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm leading-6 text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-5 w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Finding Invitation..." : "Find My Invitation"}
        </button>
      </form>
    </>
  );
}
