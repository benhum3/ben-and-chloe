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
  id: string;
  invitation_name: string;
};

type LookupResponse = {
  household: Household;
  guests: Guest[];
};

type GuestAnswer = {
  id: string;
  fullName: string;
  attending: boolean | null;
  dietaryRequirements: string;
};

export default function RSVPPage() {
  const [step, setStep] = useState<Step>("welcome");

  const [name, setName] = useState("");
  const [household, setHousehold] = useState<Household | null>(null);
  const [guestAnswers, setGuestAnswers] = useState<GuestAnswer[]>([]);

  const [songRequest, setSongRequest] = useState("");
  const [message, setMessage] = useState("");

  const [lookupError, setLookupError] = useState("");
  const [responseError, setResponseError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        setGuestAnswers([]);

        setLookupError(
          "error" in data && data.error
            ? data.error
            : "We could not find your invitation.",
        );

        return;
      }

      const lookupData = data as LookupResponse;

      setHousehold(lookupData.household);

      setGuestAnswers(
        lookupData.guests.map((guest) => ({
          id: guest.id,
          fullName: guest.full_name,
          attending: guest.attending,
          dietaryRequirements: guest.dietary_requirements ?? "",
        })),
      );

      setStep("response");
    } catch (error) {
      console.error("Guest lookup failed:", error);

      setHousehold(null);
      setGuestAnswers([]);

      setLookupError(
        "We could not check your invitation. Please try again.",
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  function updateAttendance(guestId: string, attending: boolean) {
    setResponseError("");

    setGuestAnswers((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              attending,
              dietaryRequirements: attending
                ? guest.dietaryRequirements
                : "",
            }
          : guest,
      ),
    );
  }

  function updateDietaryRequirements(
    guestId: string,
    dietaryRequirements: string,
  ) {
    setGuestAnswers((currentGuests) =>
      currentGuests.map((guest) =>
        guest.id === guestId
          ? {
              ...guest,
              dietaryRequirements,
            }
          : guest,
      ),
    );
  }

  function continueToDetails() {
    const unansweredGuest = guestAnswers.some(
      (guest) => guest.attending === null,
    );

    if (unansweredGuest) {
      setResponseError(
        "Please select an attendance response for every guest.",
      );
      return;
    }

    setResponseError("");
    setStep("details");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!household) {
      setSubmitError(
        "Your invitation details are missing. Please search again.",
      );
      return;
    }

    const incompleteResponse = guestAnswers.some(
      (guest) => guest.attending === null,
    );

    if (incompleteResponse) {
      setSubmitError(
        "Please provide an attendance response for every guest.",
      );
      setStep("response");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/rsvp-submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          householdId: household.id,
          guests: guestAnswers.map((guest) => ({
            id: guest.id,
            attending: guest.attending,
            dietaryRequirements: guest.dietaryRequirements,
          })),
          songRequest,
          message,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setSubmitError(
          data.error ?? "We could not save your RSVP. Please try again.",
        );
        return;
      }

      setStep("thanks");
    } catch (error) {
      console.error("RSVP submission failed:", error);

      setSubmitError(
        "We could not save your RSVP. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetLookup() {
    setName("");
    setHousehold(null);
    setGuestAnswers([]);
    setSongRequest("");
    setMessage("");
    setLookupError("");
    setResponseError("");
    setSubmitError("");
    setStep("lookup");
  }

  const attendingGuests = guestAnswers.filter(
    (guest) => guest.attending === true,
  );

  const nobodyAttending =
    guestAnswers.length > 0 &&
    guestAnswers.every((guest) => guest.attending === false);

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
                className="mt-5 w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLookingUp
                  ? "Finding Invitation..."
                  : "Find My Invitation"}
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

            <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-600">
              Please select a response for each guest named on the invitation.
            </p>

            <div className="mt-10 w-full max-w-lg space-y-5">
              {guestAnswers.map((guest) => (
                <div
                  key={guest.id}
                  className="border border-[#ded9cf] px-5 py-6"
                >
                  <p className="font-serif text-2xl">
                    {guest.fullName}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateAttendance(guest.id, true)
                      }
                      className={`border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition ${
                        guest.attending === true
                          ? "border-[#181818] bg-[#181818] text-[#f8f6f2]"
                          : "border-[#ded9cf] hover:border-[#181818]"
                      }`}
                    >
                      Happily Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateAttendance(guest.id, false)
                      }
                      className={`border px-4 py-4 text-[10px] uppercase tracking-[0.25em] transition ${
                        guest.attending === false
                          ? "border-[#181818] bg-[#181818] text-[#f8f6f2]"
                          : "border-[#ded9cf] hover:border-[#181818]"
                      }`}
                    >
                      Regretfully Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {responseError && (
              <p
                role="alert"
                className="mt-6 text-sm leading-6 text-red-700"
              >
                {responseError}
              </p>
            )}

            <div className="mt-8 grid w-full max-w-lg gap-4">
              <button
                type="button"
                onClick={continueToDetails}
                className="border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
              >
                Continue
              </button>

              <button
                type="button"
                onClick={resetLookup}
                className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition hover:text-[#181818]"
              >
                This Is Not My Invitation
              </button>
            </div>
          </>
        )}

        {step === "details" && household && (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
              A Few Details
            </p>

            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              {nobodyAttending ? "Before You Go" : "Before The Day"}
            </h1>

            {nobodyAttending ? (
              <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
                We&apos;re sorry you won&apos;t be able to join us. You can
                leave a message below before submitting your response.
              </p>
            ) : (
              <p className="mt-8 max-w-lg text-sm leading-8 text-neutral-600">
                Please let us know about any dietary requirements for those
                attending.
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-12 w-full max-w-lg space-y-7 text-left"
            >
              {attendingGuests.map((guest) => (
                <label key={guest.id} className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
                    Dietary Requirements — {guest.fullName}
                  </span>

                  <textarea
                    value={guest.dietaryRequirements}
                    onChange={(event) =>
                      updateDietaryRequirements(
                        guest.id,
                        event.target.value,
                      )
                    }
                    placeholder="Please let us know of any allergies or dietary requirements. Leave blank if none."
                    className="min-h-28 w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#A97A3D]"
                  />
                </label>
              ))}

              {!nobodyAttending && (
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
                    Song Request
                  </span>

                  <input
                    type="text"
                    value={songRequest}
                    onChange={(event) =>
                      setSongRequest(event.target.value)
                    }
                    placeholder="What song will get you on the dance floor?"
                    className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
                  Message
                </span>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Anything else you'd like us to know?"
                  className="min-h-28 w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#A97A3D]"
                />
              </label>

              {submitError && (
                <p
                  role="alert"
                  className="text-center text-sm leading-6 text-red-700"
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Sending Response..."
                  : "Send Response"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmitError("");
                  setStep("response");
                }}
                disabled={isSubmitting}
                className="w-full text-center text-[10px] uppercase tracking-[0.25em] text-neutral-500 transition hover:text-[#181818] disabled:opacity-50"
              >
                Back To Guest Responses
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
              {nobodyAttending
                ? "Thank you for letting us know. We’re sorry you won’t be able to join us."
                : "Thank you for taking the time to respond. We can’t wait to celebrate with you."}
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