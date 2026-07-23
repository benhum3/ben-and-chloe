"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import GuestManagement, {
  type ManagedHousehold,
} from "@/components/admin/GuestManagement";
import PlanningTasks from "@/components/admin/PlanningTasks";
import Monogram from "@/components/Monogram";

type GuestStatus = "all" | "attending" | "declined" | "pending";
type InvitationType = "day" | "evening";
type InvitationFilter = "all" | InvitationType;

type DashboardGuest = {
  id: string;
  fullName: string;
  householdId: string;
  householdName: string;
  invitationType: InvitationType;
  attending: boolean | null;
  dietaryRequirements: string | null;
  submittedAt: string | null;
};

type DashboardData = {
  stats: {
    totalGuests: number;
    attending: number;
    declined: number;
    pending: number;
    totalHouseholds: number;
    dayHouseholds: number;
    eveningHouseholds: number;
    householdsResponded: number;
    householdsPending: number;
  };
  latestResponses: Array<{
    id: string;
    invitationName: string;
    invitationType: InvitationType;
    submittedAt: string;
    attending: number;
    declined: number;
  }>;
  guests: DashboardGuest[];
  songRequests: Array<{
    id: string;
    invitationName: string;
    songRequest: string;
  }>;
  messages: Array<{
    id: string;
    invitationName: string;
    message: string;
  }>;
  generatedAt: string;
};

function getGuestStatus(guest: DashboardGuest) {
  if (guest.attending === true) {
    return "Attending";
  }

  if (guest.attending === false) {
    return "Declined";
  }

  return "Pending";
}

function escapeCsv(value: string | number | null) {
  const rawText = value === null ? "" : String(value);
  const text = /^[=+\-@\t\r]/.test(rawText) ? `'${rawText}` : rawText;

  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, headings: string[], rows: Array<Array<string | number | null>>) {
  const csv = [
    headings.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<GuestStatus>("all");
  const [invitationFilter, setInvitationFilter] =
    useState<InvitationFilter>("all");

  const loadDashboard = useCallback(async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setDashboardError("");

      try {
        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          setUnlocked(false);
          setDashboardData(null);
          return;
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load dashboard.");
        }

        setDashboardData(data);
        setUnlocked(true);
      } catch (loadError) {
        setDashboardError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard.",
        );
      } finally {
        if (showLoading) setLoading(false);
        setAuthChecking(false);
      }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSigningIn(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      setPassword("");
      await loadDashboard();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setUnlocked(false);
    setDashboardData(null);
  }

  const filteredGuests = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    const normalisedSearch = searchTerm.trim().toLowerCase();

    return dashboardData.guests.filter((guest) => {
      const matchesSearch =
        normalisedSearch.length === 0 ||
        guest.fullName.toLowerCase().includes(normalisedSearch) ||
        guest.householdName.toLowerCase().includes(normalisedSearch) ||
        guest.dietaryRequirements
          ?.toLowerCase()
          .includes(normalisedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "attending" &&
          guest.attending === true) ||
        (statusFilter === "declined" &&
          guest.attending === false) ||
        (statusFilter === "pending" &&
          guest.attending === null);

      const matchesInvitation =
        invitationFilter === "all" ||
        guest.invitationType === invitationFilter;

      return matchesSearch && matchesStatus && matchesInvitation;
    });
  }, [dashboardData, invitationFilter, searchTerm, statusFilter]);

  const managedHouseholds = useMemo<ManagedHousehold[]>(() => {
    if (!dashboardData) return [];

    const grouped = new Map<string, ManagedHousehold>();

    dashboardData.guests.forEach((guest) => {
      const household = grouped.get(guest.householdId);
      const managedGuest = {
        id: guest.id,
        fullName: guest.fullName,
        attending: guest.attending,
      };

      if (household) {
        household.guests.push(managedGuest);
      } else {
        grouped.set(guest.householdId, {
          id: guest.householdId,
          invitationName: guest.householdName,
          invitationType: guest.invitationType,
          guests: [managedGuest],
        });
      }
    });

    return Array.from(grouped.values()).sort((left, right) =>
      left.invitationName.localeCompare(right.invitationName),
    );
  }, [dashboardData]);

  function exportGuests() {
    if (!dashboardData) {
      return;
    }

    const headings = [
      "Guest",
      "Household",
      "Invitation type",
      "Status",
      "Dietary requirements",
      "RSVP submitted",
    ];

    const rows = dashboardData.guests.map((guest) => [
      guest.fullName,
      guest.householdName,
      guest.invitationType === "day" ? "Day" : "Evening",
      getGuestStatus(guest),
      guest.dietaryRequirements ?? "",
      guest.submittedAt
        ? new Date(guest.submittedAt).toLocaleString("en-GB")
        : "",
    ]);

    downloadCsv(
      `wedding-guests-${new Date().toISOString().slice(0, 10)}.csv`,
      headings,
      rows,
    );
  }

  function exportFullBackup() {
    if (!dashboardData) return;

    const songRequests = new Map(
      dashboardData.songRequests.map((request) => [
        request.id,
        request.songRequest,
      ]),
    );
    const messages = new Map(
      dashboardData.messages.map((message) => [
        message.id,
        message.message,
      ]),
    );

    downloadCsv(
      `wedding-rsvp-backup-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Guest",
        "Household",
        "Invitation type",
        "Status",
        "Dietary requirements",
        "Song request",
        "Guest message",
        "RSVP submitted",
      ],
      dashboardData.guests.map((guest) => [
        guest.fullName,
        guest.householdName,
        guest.invitationType === "day" ? "Day" : "Evening",
        getGuestStatus(guest),
        guest.dietaryRequirements ?? "",
        songRequests.get(guest.householdId) ?? "",
        messages.get(guest.householdId) ?? "",
        guest.submittedAt
          ? new Date(guest.submittedAt).toLocaleString("en-GB")
          : "",
      ]),
    );
  }

  function exportCatering() {
    if (!dashboardData) return;

    const attendingGuests = dashboardData.guests.filter(
      (guest) => guest.attending === true,
    );

    downloadCsv(
      `wedding-catering-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Guest", "Invitation type", "Dietary requirements"],
      attendingGuests.map((guest) => [
        guest.fullName,
        guest.invitationType === "day" ? "Day" : "Evening",
        guest.dietaryRequirements?.trim() || "None provided",
      ]),
    );
  }

  function exportSongRequests() {
    if (!dashboardData) return;

    downloadCsv(
      `wedding-song-requests-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Song request", "Requested by"],
      dashboardData.songRequests.map((request) => [
        request.songRequest,
        request.invitationName,
      ]),
    );
  }

  function exportPending() {
    if (!dashboardData) return;

    const pendingHouseholds = new Map<string, DashboardGuest[]>();

    dashboardData.guests
      .filter((guest) => guest.attending === null)
      .forEach((guest) => {
        const current = pendingHouseholds.get(guest.householdId) ?? [];
        pendingHouseholds.set(guest.householdId, [...current, guest]);
      });

    downloadCsv(
      `pending-rsvps-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Household", "Invitation type", "Guests"],
      Array.from(pendingHouseholds.values()).map((guests) => [
        guests[0]?.householdName ?? "",
        guests[0]?.invitationType === "evening" ? "Evening" : "Day",
        guests.map((guest) => guest.fullName).join(", "),
      ]),
    );
  }

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f2] text-[#181818]">
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">
          Opening private area
        </p>
      </main>
    );
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
            <label htmlFor="admin-password" className="sr-only">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              name="admin-password"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "admin-login-error" : undefined}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-center text-sm outline-none transition focus:border-[#A97A3D]"
            />

            {error && (
              <p
                id="admin-login-error"
                role="alert"
                className="mt-4 text-xs uppercase tracking-[0.2em] text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSigningIn || !password}
              className="mt-6 w-full rounded-full border border-[#A97A3D] bg-[#A97A3D] px-6 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-transparent hover:text-[#A97A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSigningIn ? "Signing In..." : "Enter"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-12 text-[10px] uppercase tracking-[0.3em] text-neutral-500 transition hover:text-[#181818]"
          >
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  const stats = dashboardData?.stats;
  const responseRate = stats?.totalHouseholds
    ? Math.round(
        ((stats.householdsResponded ?? 0) / stats.totalHouseholds) * 100,
      )
    : 0;
  const dietaryRequirementsCount =
    dashboardData?.guests.filter(
      (guest) =>
        guest.attending === true &&
        Boolean(guest.dietaryRequirements?.trim()),
    ).length ?? 0;
  const dayGuestsAttending =
    dashboardData?.guests.filter(
      (guest) =>
        guest.invitationType === "day" && guest.attending === true,
    ).length ?? 0;
  const eveningGuestsAttending =
    dashboardData?.guests.filter(
      (guest) =>
        guest.invitationType === "evening" && guest.attending === true,
    ).length ?? 0;

  const statisticCards = [
    ["Guests Invited", stats?.totalGuests ?? "—"],
    ["Attending", stats?.attending ?? "—"],
    ["Declined", stats?.declined ?? "—"],
    ["Guests Pending", stats?.pending ?? "—"],
    ["Day Households", stats?.dayHouseholds ?? "—"],
    ["Evening Households", stats?.eveningHouseholds ?? "—"],
    ["Households Replied", stats?.householdsResponded ?? "—"],
    ["Households Pending", stats?.householdsPending ?? "—"],
  ];

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-5 py-16 text-[#181818] md:px-8 md:py-24">
      <section className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-center text-center">
          <Monogram />

          <p className="mb-6 text-xs uppercase tracking-[0.42em] text-neutral-500">
            Wedding Dashboard
          </p>

          <h1 className="font-serif text-5xl md:text-7xl">
            Benjamin & Chloe
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-8 text-neutral-600">
            Invitations, responses and wedding planning in one private place.
          </p>

        </div>

        <nav
          aria-label="Dashboard sections"
          className="sticky top-[calc(env(safe-area-inset-top)+0.75rem)] z-40 mx-auto mb-12 flex w-fit max-w-full flex-wrap justify-center gap-x-5 gap-y-2 rounded-full border border-[#ded9cf]/80 bg-[#f8f6f2]/90 px-5 py-3 text-[9px] uppercase tracking-[0.2em] text-neutral-500 shadow-[0_8px_30px_rgba(24,24,24,0.06)] backdrop-blur-md md:top-3 md:gap-x-7 md:px-7 md:text-[10px] md:tracking-[0.24em]"
        >
          <a href="#overview" className="transition hover:text-[#A97A3D]">Overview</a>
          <a href="#planning" className="transition hover:text-[#A97A3D]">Planning</a>
          <a href="#guest-management" className="transition hover:text-[#A97A3D]">Add Guests</a>
          <a href="#guests" className="transition hover:text-[#A97A3D]">Guests</a>
          <button type="button" onClick={() => void handleLogout()} className="transition hover:text-[#A97A3D]">
            Sign Out
          </button>
        </nav>

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

        {!loading && !dashboardError && dashboardData && (
          <>
            <div id="overview" className="grid scroll-mt-28 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {statisticCards.map(([label, value]) => (
                <div
                  key={label}
                  className="border border-[#e6e2da] bg-[#f8f6f2]/70 px-3 py-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-sm sm:p-8"
                >
                  <p className="font-serif text-3xl sm:text-5xl">{value}</p>

                  <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-neutral-500 sm:mt-4 sm:text-xs sm:tracking-[0.25em]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <article className="border border-[#ded9cf] p-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                      RSVP Progress
                    </p>
                    <p className="mt-3 font-serif text-4xl">{responseRate}%</p>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {stats?.householdsResponded ?? 0}/{stats?.totalHouseholds ?? 0}
                  </p>
                </div>
                <div className="mt-5 h-1 overflow-hidden bg-[#ded9cf]">
                  <div
                    role="progressbar"
                    aria-label="Household RSVP progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={responseRate}
                    className="h-full bg-[#A97A3D] transition-[width] duration-500"
                    style={{ width: `${responseRate}%` }}
                  />
                </div>
              </article>

              <article className="border border-[#ded9cf] p-7">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Confirmed Attendance
                </p>
                <div className="mt-5 flex gap-8">
                  <div>
                    <p className="font-serif text-3xl">{dayGuestsAttending}</p>
                    <p className="mt-1 text-xs text-neutral-500">Day guests</p>
                  </div>
                  <div>
                    <p className="font-serif text-3xl">{eveningGuestsAttending}</p>
                    <p className="mt-1 text-xs text-neutral-500">Evening guests</p>
                  </div>
                </div>
              </article>

              <article className="border border-[#ded9cf] p-7">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Catering Attention
                </p>
                <p className="mt-3 font-serif text-4xl">{dietaryRequirementsCount}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  attending guests have supplied dietary requirements
                </p>
                <button type="button" onClick={exportCatering} className="mt-5 border-b border-[#A97A3D] pb-1 text-[9px] uppercase tracking-[0.22em] text-[#A97A3D]">
                  Export catering list
                </button>
              </article>
            </div>

            <div className="mt-20">
              <PlanningTasks />
            </div>

            <div className="mt-20">
              <GuestManagement
                households={managedHouseholds}
                onChanged={() => loadDashboard(false)}
              />
            </div>

            <div id="guests" className="mt-20 scroll-mt-28">
              <div className="flex flex-col gap-6 border-b border-[#e6e2da] pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                    Guest List
                  </p>

                  <h2 className="mt-3 font-serif text-4xl">
                    Manage responses
                  </h2>

                  <p className="mt-3 text-sm text-neutral-600">
                    Showing {filteredGuests.length} of{" "}
                    {dashboardData.guests.length} guests.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={exportFullBackup}
                    className="border border-[#A97A3D] bg-[#A97A3D] px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-white transition hover:bg-transparent hover:text-[#A97A3D]"
                  >
                    Full Backup CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportPending}
                    className="border border-[#A97A3D] px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-[#A97A3D] transition hover:bg-[#A97A3D] hover:text-white"
                  >
                    Pending RSVPs
                  </button>
                  <button
                    type="button"
                    onClick={exportGuests}
                    className="border border-[#181818] px-5 py-3 text-[10px] uppercase tracking-[0.22em] transition hover:bg-[#181818] hover:text-[#f8f6f2]"
                  >
                    All Guests CSV
                  </button>
                </div>
              </div>

              <div className="grid gap-4 py-6 md:grid-cols-[1fr_auto_auto]">
                <input
                  aria-label="Search guests"
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search guest, household or dietary requirement"
                  className="w-full border border-[#e6e2da] bg-transparent px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                />

                <select
                  aria-label="Filter guests by RSVP status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as GuestStatus)
                  }
                  className="border border-[#e6e2da] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                >
                  <option value="all">All statuses</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  aria-label="Filter guests by invitation type"
                  value={invitationFilter}
                  onChange={(event) =>
                    setInvitationFilter(
                      event.target.value as InvitationFilter,
                    )
                  }
                  className="border border-[#e6e2da] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                >
                  <option value="all">All invitations</option>
                  <option value="day">Day guests</option>
                  <option value="evening">Evening guests</option>
                </select>
              </div>

              <div className="hidden overflow-x-auto border-y border-[#e6e2da] md:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="border-b border-[#e6e2da] text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                      <th className="px-4 py-5 font-normal">
                        Guest
                      </th>
                      <th className="px-4 py-5 font-normal">
                        Household
                      </th>
                      <th className="px-4 py-5 font-normal">
                        Invitation
                      </th>
                      <th className="px-4 py-5 font-normal">
                        Status
                      </th>
                      <th className="px-4 py-5 font-normal">
                        Dietary requirements
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e6e2da]">
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id}>
                        <td className="px-4 py-5">
                          <p className="font-serif text-xl">
                            {guest.fullName}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-sm text-neutral-600">
                          {guest.householdName}
                        </td>

                        <td className="px-4 py-5">
                          <InvitationTypeBadge type={guest.invitationType} />
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge attending={guest.attending} />
                        </td>

                        <td className="px-4 py-5 text-sm text-neutral-600">
                          {guest.dietaryRequirements?.trim() ||
                            "None provided"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#e6e2da] border-y border-[#e6e2da] md:hidden">
                {filteredGuests.map((guest) => (
                  <article key={guest.id} className="py-6">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-serif text-2xl">
                        {guest.fullName}
                      </p>

                      <StatusBadge attending={guest.attending} />
                    </div>

                    <p className="mt-2 text-sm text-neutral-600">
                      {guest.householdName}
                    </p>

                    <div className="mt-3">
                      <InvitationTypeBadge type={guest.invitationType} />
                    </div>

                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Dietary requirements
                    </p>

                    <p className="mt-2 text-sm text-neutral-700">
                      {guest.dietaryRequirements?.trim() ||
                        "None provided"}
                    </p>
                  </article>
                ))}
              </div>

              {filteredGuests.length === 0 && (
                <div className="border-b border-[#e6e2da] py-12 text-center">
                  <p className="text-sm text-neutral-600">
                    No guests match that search.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-20 grid gap-12 lg:grid-cols-2">
              <section>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                      Song Requests
                    </p>

                    <h2 className="mt-3 font-serif text-4xl">
                      Dance floor suggestions
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={exportSongRequests}
                    disabled={dashboardData.songRequests.length === 0}
                    className="self-start border-b border-[#A97A3D] pb-1 text-[9px] uppercase tracking-[0.22em] text-[#A97A3D] transition hover:text-[#181818] disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400 sm:self-auto"
                  >
                    Export for DJ
                  </button>
                </div>

                <div className="mt-8 divide-y divide-[#e6e2da] border-y border-[#e6e2da]">
                  {dashboardData.songRequests.length > 0 ? (
                    dashboardData.songRequests.map((request) => (
                      <article key={request.id} className="py-6">
                        <p className="font-serif text-xl">
                          {request.songRequest}
                        </p>

                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">
                          {request.invitationName}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="py-8 text-sm text-neutral-600">
                      No song requests yet.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                  Guest Messages
                </p>

                <h2 className="mt-3 font-serif text-4xl">
                  Notes from your guests
                </h2>

                <div className="mt-8 divide-y divide-[#e6e2da] border-y border-[#e6e2da]">
                  {dashboardData.messages.length > 0 ? (
                    dashboardData.messages.map((message) => (
                      <article key={message.id} className="py-6">
                        <p className="text-sm leading-7 text-neutral-700">
                          “{message.message}”
                        </p>

                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-neutral-500">
                          {message.invitationName}
                        </p>
                      </article>
                    ))
                  ) : (
                    <p className="py-8 text-sm text-neutral-600">
                      No guest messages yet.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-20 border-t border-[#e6e2da] pt-10">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                    Latest Responses
                  </p>

                  <p className="mt-3 text-sm text-neutral-600">
                    Most recently submitted household RSVPs.
                  </p>
                </div>

                <p className="text-xs text-neutral-500">
                  {stats?.householdsResponded ?? 0} of{" "}
                  {stats?.totalHouseholds ?? 0} households
                </p>
              </div>

              {dashboardData.latestResponses.length > 0 ? (
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

                        <div className="mt-2">
                          <InvitationTypeBadge type={response.invitationType} />
                        </div>

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

            <div className="mt-12 flex flex-col gap-3 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Last updated{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(dashboardData.generatedAt))}
              </p>

              <Link
                href="/"
                className="uppercase tracking-[0.25em] transition hover:text-[#181818]"
              >
                Return Home
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function StatusBadge({
  attending,
}: {
  attending: boolean | null;
}) {
  if (attending === true) {
    return (
      <span className="inline-flex whitespace-nowrap border border-green-700/30 bg-green-700/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-green-800">
        Attending
      </span>
    );
  }

  if (attending === false) {
    return (
      <span className="inline-flex whitespace-nowrap border border-red-700/30 bg-red-700/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-red-800">
        Declined
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap border border-neutral-400/40 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
      Pending
    </span>
  );
}

function InvitationTypeBadge({ type }: { type: InvitationType }) {
  return (
    <span className="inline-flex whitespace-nowrap border border-[#A97A3D]/35 bg-[#A97A3D]/5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#8A642F]">
      {type === "day" ? "Day Guest" : "Evening Guest"}
    </span>
  );
}
