"use client";

import { useEffect, useState } from "react";
import Monogram from "@/components/Monogram";

type DashboardData = {
  stats: {
    totalGuests: number;
    attending: number;
    declined: number;
    pending: number;
    totalHouseholds: number;
    householdsResponded: number;
    householdsPending: number;
  };
  latestResponses: Array<{
    id: string;
    invitationName: string;
    submittedAt: string;
    attending: number;
    declined: number;
  }>;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password.");
    }
  }

  useEffect(() => {
    if (!unlocked) {
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      setDashboardError("");

      try {
        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load dashboard.");
        }

        setDashboardData(data);
      } catch (loadError) {
        setDashboardError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [unlocked]);

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
              onChange={(event) => setPassword(event.target.value)}
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

  const stats = dashboardData?.stats;

  const statisticCards = [
    ["Guests Invited", stats?.totalGuests ?? "—"],
    ["Attending", stats?.attending ?? "—"],
    ["Declined", stats?.declined ?? "—"],
    ["Guests Pending", stats?.pending ?? "—"],
    ["Households Replied", stats?.householdsResponded ?? "—"],
    ["Households Pending", stats?.householdsPending ?? "—"],
  ];

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-6 py-20 text-[#181818] md:py-24">
      <section className="mx-auto max-w-6xl">
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

        {loading && (
          <div className="border border-[#e6e2da] px-6 py-12 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Loading responses
            </p>
          </div>
        )}

        {dashboardError && (
          <div className="border border-red-200 px-6 py-8 text-center">
            <p className="text-sm text-red-700">{dashboardError}</p>
          </div>
        )}

        {!loading && !dashboardError && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statisticCards.map(([label, value]) => (
                <div
                  key={label}
                  className="border border-[#e6e2da] bg-[#f8f6f2]/70 p-8 text-center"
                >
                  <p className="font-serif text-5xl">{value}</p>

                  <p className="mt-4 text-xs uppercase tracking-[0.25em] text-neutral-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 border-t border-[#e6e2da] pt-10">
              <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                    Latest Responses
                  </p>

                  <p className="mt-3 text-sm text-neutral-600">
                    Most recently submitted household RSVPs.
                  </p>
                </div>

                <p className="shrink-0 text-xs text-neutral-500">
                  {stats?.householdsResponded ?? 0} of{" "}
                  {stats?.totalHouseholds ?? 0} households
                </p>
              </div>

              {dashboardData?.latestResponses.length ? (
                <div className="divide-y divide-[#e6e2da] border-y border-[#e6e2da]">
                  {dashboardData.latestResponses.map((response) => (
                    <div
                      key={response.id}
                      className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-serif text-2xl">
                          {response.invitationName}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {new Intl.DateTimeFormat("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(response.submittedAt))}
                        </p>
                      </div>

                      <div className="flex gap-5 text-xs uppercase tracking-[0.18em]">
                        <span className="text-neutral-700">
                          {response.attending} attending
                        </span>

                        <span className="text-neutral-500">
                          {response.declined} declined
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-y border-[#e6e2da] py-10">
                  <p className="text-sm text-neutral-600">
                    No responses received yet.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

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