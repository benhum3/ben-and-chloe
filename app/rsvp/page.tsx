"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import DetailsStep from "@/components/rsvp/DetailsStep";
import LookupStep from "@/components/rsvp/LookupStep";
import ResponseStep from "@/components/rsvp/ResponseStep";
import ThankYouStep from "@/components/rsvp/ThankYouStep";
import WelcomeStep from "@/components/rsvp/WelcomeStep";
import Monogram from "@/components/Monogram";
import type {
  GuestAnswer,
  Household,
  LookupResponse,
  Step,
} from "@/types/rsvp";

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
  const [wasUpdate, setWasUpdate] = useState(false);

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
        body: JSON.stringify({ name: trimmedName }),
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
      setSongRequest(lookupData.household.song_request ?? "");
      setMessage(lookupData.household.message ?? "");
      setWasUpdate(Boolean(lookupData.household.submitted_at));

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
          ? { ...guest, dietaryRequirements }
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

    if (guestAnswers.some((guest) => guest.attending === null)) {
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
    setWasUpdate(false);
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
          <WelcomeStep onContinue={() => setStep("lookup")} />
        )}

        {step === "lookup" && (
          <LookupStep
            name={name}
            error={lookupError}
            isLoading={isLookingUp}
            onNameChange={(value) => {
              setName(value);
              if (lookupError) setLookupError("");
            }}
            onSubmit={handleLookup}
          />
        )}

        {step === "response" && household && (
          <ResponseStep
            household={household}
            guests={guestAnswers}
            error={responseError}
            onAttendanceChange={updateAttendance}
            onContinue={continueToDetails}
            onReset={resetLookup}
          />
        )}

        {step === "details" && household && (
          <DetailsStep
            household={household}
            attendingGuests={attendingGuests}
            nobodyAttending={nobodyAttending}
            songRequest={songRequest}
            message={message}
            submitError={submitError}
            isSubmitting={isSubmitting}
            onDietaryChange={updateDietaryRequirements}
            onSongRequestChange={setSongRequest}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            onBack={() => {
              setSubmitError("");
              setStep("response");
            }}
          />
        )}

        {step === "thanks" && (
          <ThankYouStep
            nobodyAttending={nobodyAttending}
            wasUpdate={wasUpdate}
          />
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
