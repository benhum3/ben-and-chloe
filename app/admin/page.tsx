"use client";

import { useState } from "react";
import Monogram from "@/components/Monogram";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password.");
    }
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#f8f6f2] px-6 py-24 text-[#181818]">
        <section className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center">
          <Monogram />

          <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
            Admin Access
          </p>

          <h1 className="font-serif text-5xl leading-none md:text-6xl">
            Private Area
          </h1>

          <form onSubmit={handleSubmit} className="mt-12 w-full">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-center text-sm outline-none transition focus:border-[#A97A3D]"
            />

            {error && (
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-6 w-full border border-[#181818] px-6 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
            >
              Enter
            </button>
          </form>

          <a
            href="/"
            className="mt-12 text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition hover:text-[#181818]"
          >
            Return Home
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-6 py-24 text-[#181818]">
      <section className="mx-auto max-w-5xl">
        <div className="mb-16 flex flex-col items-center text-center">
          <Monogram />

          <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
            Wedding Dashboard
          </p>

          <h1 className="font-serif text-5xl md:text-7xl">
            Benjamin & Chloe
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-8 text-neutral-600">
            A private dashboard for tracking invitations, responses and guest
            details.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Invited", "70"],
            ["Responded", "0"],
            ["Awaiting Reply", "70"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border border-[#e6e2da] bg-[#f8f6f2]/70 p-8 text-center"
            >
              <p className="font-serif text-5xl">{value}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-[#e6e2da] pt-10">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-neutral-500">
            Latest Responses
          </p>

          <div className="space-y-4 text-sm text-neutral-600">
            <p>No responses yet.</p>
          </div>
        </div>

        <a
          href="/"
          className="mt-16 inline-block text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition hover:text-[#181818]"
        >
          Return Home
        </a>
      </section>
    </main>
  );
}