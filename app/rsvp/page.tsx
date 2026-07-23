"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

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
  const stepContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === "welcome") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    const focusTimer = window.setTimeout(
      () => stepContentRef.current?.focus(),
      prefersReducedMotion ? 0 : 180,
    );

    return () => window.clearTimeout(focusTimer);
  }, [step]);

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

  const journeySteps: Step[] = ["lookup", "response", "details"];
  const currentJourneyStep = journeySteps.indexOf(step);
  const showProgress = currentJourneyStep >= 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f6f2] px-6 py-20 text-[#181818] md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-12 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-[#A97A3D]/10 md:h-[46rem] md:w-[46rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-36 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full border border-[#A97A3D]/10 md:h-[32rem] md:w-[32rem]"
      />

      <section className="relative z-10 mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="rsvp-monogram-enter">
          <Monogram />
        </div>

        {showProgress && (
          <div
            className="mb-10 mt-1 flex items-center"
            role="progressbar"
            aria-label={`RSVP step ${currentJourneyStep + 1} of ${journeySteps.length}`}
            aria-valuemin={1}
            aria-valuemax={journeySteps.length}
            aria-valuenow={currentJourneyStep + 1}
          >
            {journeySteps.map((journeyStep, index) => (
              <div key={journeyStep} className="flex items-center">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className={`h-px w-12 transition-colors duration-500 sm:w-16 ${
                      index <= currentJourneyStep
                        ? "bg-[#A97A3D]"
                        : "bg-[#ded9cf]"
                    }`}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rotate-45 border transition-all duration-500 ${
                    index <= currentJourneyStep
                      ? "border-[#A97A3D] bg-[#A97A3D]"
                      : "border-[#cfc8bb] bg-[#f8f6f2]"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        <div
          key={step}
          ref={stepContentRef}
          tabIndex={-1}
          role="region"
          aria-label="RSVP form"
          aria-live="polite"
          className="rsvp-step-enter flex w-full flex-col items-center focus:outline-none"
        >
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
            onBack={() => {
              setLookupError("");
              setStep("welcome");
            }}
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
            invitationType={household?.invitation_type ?? "day"}
          />
          )}
        </div>

        <Link
          href="/"
          className="mt-14 text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition duration-300 hover:text-[#A97A3D] focus-visible:outline-none focus-visible:text-[#A97A3D]"
        >
          Return Home
        </Link>
      </section>
    </main>
  );
}
