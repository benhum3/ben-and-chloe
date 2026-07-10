"use client";

import { useState } from "react";
import Monogram from "@/components/Monogram";

export default function RSVPPage() {
  const [step, setStep] = useState<
    "welcome" | "lookup" | "response" | "details" | "thanks"
  >("welcome");

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
            <button onClick={() => setStep("lookup")} className="mt-12 border border-[#181818] px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]">
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

            <form className="mt-12 w-full max-w-md">
              <input
                type="text"
                placeholder="Benjamin Humphrey"
                className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-center font-serif text-lg outline-none transition focus:border-[#A97A3D]"
              />
              <button type="button" onClick={() => setStep("response")} className="mt-5 w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]">
                Continue
              </button>
            </form>
          </>
        )}

        {step === "response" && (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
              Your Response
            </p>
            <h1 className="font-serif text-5xl leading-none md:text-7xl">
              Will You Join Us?
            </h1>

            <div className="mt-12 grid w-full max-w-md gap-4">
              <button onClick={() => setStep("details")} className="border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]">
                Happily Accept
              </button>
              <button onClick={() => setStep("thanks")} className="border border-[#e6e2da] px-6 py-4 text-xs uppercase tracking-[0.3em] text-neutral-500 transition hover:border-[#181818] hover:text-[#181818]">
                Regretfully Decline
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
            <p className="mt-10 font-serif text-3xl">Benjamin & Chloe</p>
          </>
        )}

        <a href="/" className="mt-14 text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition hover:text-[#181818]">
          Return Home
        </a>
      </section>
    </main>
  );
}