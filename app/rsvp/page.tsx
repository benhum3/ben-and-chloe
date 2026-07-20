"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import Monogram from "@/components/Monogram";

type Step = "welcome" | "lookup" | "response" | "details" | "thanks";

type Guest = {
  id: string;
  household_id: string;
  full_name: string;
  attending: boolean | null;
  dietary_requirements: string | null;
};

type Household = {
  invitation_name: string;
};

type LookupResponse = {
  household: Household;
  guests: Guest[];
};

export default function RSVPPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [household, setHousehold] = useState<Household | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [lookupError, setLookupError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setLookupError("Please enter your name.");
      return;
    }

    setIsLookingUp(true);
    setLookupError("");

    try {
      const response = await fetch("/api/guest-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = (await response.json()) as
        | LookupResponse
        | { error?: string };

      if (!response.ok) {
        setHousehold(null);
        setGuests([]);
        setLookupError(
          "error" in data && data.error
            ? data.error
            : "We could not find your invitation.",
        );
        return;
      }

      const lookupData = data as LookupResponse;

      setHousehold(lookupData.household);
      setGuests(lookupData.guests);
      setStep("response");
    } catch (error) {
      console.error("Guest lookup failed:", error);

      setHousehold(null);
      setGuests([]);
      setLookupError(
        "We could not check your invitation. Please try again.",
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  function resetLookup() {
    setHousehold(null);
    setGuests([]);
    setLookupError("");
    setName("");
    setStep("lookup");
  }

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-6 py-24 text-[#181818]">
      <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <Monogram />

        {step === "welcome" && (
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
              onClick={() => setStep("lookup")}
              className="mt-12 border border-[#181818] px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
            >
              Continue
            </button>
          </>
        )}

        {step === "lookup" && (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
              Find Your Invitation
            </p>

            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Your Details
            </h1>

            <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
              Please enter the name exactly as it appears on your wedding
              invitation.
            </p>

            <form
              onSubmit={handleLookup}
              className="mt-12 w-full max-w-md"
            >
              <label htmlFor="guest-name" className="sr-only">
                Name on invitation
              </label>

              <input
                id="guest-name"
                name="guest-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  if (lookupError) {
                    setLookupError("");
                  }
                }}
                placeholder="Benjamin Humphrey"
                autoComplete="name"
                disabled={isLookingUp}
                className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-center font-serif text-lg outline-none transition placeholder:text-neutral-400 focus:border-[#A97A3D] disabled:cursor-not-allowed disabled:opacity-60"
              />

              {lookupError && (
                <p
                  role="alert"
                  className="mt-4 text-sm leading-6 text-red-700"
                >
                  {lookupError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLookingUp}
                className="mt-5 w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#181818]"
              >
                {isLookingUp ? "Finding Invitation..." : "Find My Invitation"}
              </button>
            </form>
          </>
        )}

        {step === "response" && household && (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
              Your Invitation
            </p>

            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Will You Join Us?
            </h1>

            <p className="mt-8 max-w-lg font-serif text-2xl leading-9">
              {household.invitation_name}
            </p>

            <div className="mt-10 w-full max-w-md border-y border-[#ded9cf] py-7">
              <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                Guests Included
              </p>

              <ul className="space-y-3">
                {guests.map((guest) => (
                  <li
                    key={guest.id}
                    className="font-serif text-xl text-[#181818]"
                  >
                    {guest.full_name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 grid w-full max-w-md gap-4">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
              >
                Happily Accept
              </button>

              <button
                type="button"
                onClick={() => setStep("thanks")}
                className="border border-[#e6e2da] px-6 py-4 text-xs uppercase tracking-[0.3em] text-neutral-500 transition hover:border-[#181818] hover:text-[#181818]"
              >
                Regretfully Decline
              </button>

              <button
                type="button"
                onClick={resetLookup}
                className="mt-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition hover:text-[#181818]"
              >
                This Is Not My Invitation
              </button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
              A Few Details
            </p>

            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Before The Day
            </h1>

            {guests.length > 0 && (
              <div className="mt-8 w-full max-w-lg">
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Responding For
                </p>

                <p className="mt-3 font-serif text-2xl">
                  {guests.map((guest) => guest.full_name).join(" & ")}
                </p>
              </div>
            )}

            <form className="mt-12 w-full max-w-lg space-y-6 text-left">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Dietary Requirements
                </span>

                <textarea
                  placeholder="Please let us know of any allergies or dietary requirements."
                  className="min-h-28 w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#A97A3D]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Song Request
                </span>

                <input
                  type="text"
                  placeholder="What song will get you on the dance floor?"
                  className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Message
                </span>

                <textarea
                  placeholder="Anything else you'd like us to know?"
                  className="min-h-28 w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#A97A3D]"
                />
              </label>

              <button
                type="button"
                onClick={() => setStep("thanks")}
                className="w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
              >
                Send Response
              </button>
            </form>
          </>
        )}

        {step === "thanks" && (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
              Thank You
            </p>

            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Response Received
            </h1>

            <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
              Thank you for taking the time to respond. We can&apos;t wait to
              celebrate with you.
            </p>

            <p className="mt-10 font-serif text-3xl">
              Benjamin &amp; Chloe
            </p>
          </>
        )}

        <Link
          href="/"
          className="mt-14 text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition hover:text-[#181818]"
        >
          Return Home
        </Link>
      </section>
    </main>
  );
}