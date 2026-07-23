"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type InvitationType = "day" | "evening";

export type ManagedHousehold = {
  id: string;
  invitationName: string;
  invitationType: InvitationType;
  guests: Array<{
    id: string;
    fullName: string;
    attending: boolean | null;
  }>;
};

type ImportHousehold = {
  invitationName: string;
  invitationType: InvitationType;
  guests: string[];
};

type Mode = "manual" | "upload" | "manage";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);

  return rows;
}

function normaliseHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function buildImportPreview(text: string) {
  const rows = parseCsv(text);

  if (rows.length < 2) {
    throw new Error("The CSV needs a heading row and at least one guest.");
  }

  const headers = rows[0].map(normaliseHeader);
  const householdIndex = headers.indexOf("household");
  const invitationIndex = headers.indexOf("invitationtype");
  const guestIndex = headers.indexOf("guestname");

  if (householdIndex < 0 || invitationIndex < 0 || guestIndex < 0) {
    throw new Error(
      "Use the columns Household, Invitation Type and Guest Name.",
    );
  }

  const grouped = new Map<string, ImportHousehold>();

  rows.slice(1).forEach((row, index) => {
    const invitationName = row[householdIndex]?.trim() ?? "";
    const rawType = row[invitationIndex]?.trim().toLowerCase() ?? "";
    const guestName = row[guestIndex]?.trim() ?? "";

    if (!invitationName || !guestName || (rawType !== "day" && rawType !== "evening")) {
      throw new Error(`Please check CSV row ${index + 2}.`);
    }

    const key = invitationName.toLowerCase();
    const existing = grouped.get(key);

    if (existing && existing.invitationType !== rawType) {
      throw new Error(
        `The invitation type is inconsistent for ${invitationName}.`,
      );
    }

    if (existing) {
      if (
        existing.guests.some(
          (guest) => guest.toLowerCase() === guestName.toLowerCase(),
        )
      ) {
        throw new Error(`${guestName} is duplicated in ${invitationName}.`);
      }

      existing.guests.push(guestName);
    } else {
      grouped.set(key, {
        invitationName,
        invitationType: rawType,
        guests: [guestName],
      });
    }
  });

  return Array.from(grouped.values());
}

function downloadTemplate() {
  const csv = [
    "Household,Invitation Type,Guest Name",
    '"John & Sarah Smith",Day,John Smith',
    '"John & Sarah Smith",Day,Sarah Smith',
    "David Jones,Evening,David Jones",
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "wedding-guest-list-template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function GuestManagement({
  households,
  onChanged,
}: {
  households: ManagedHousehold[];
  onChanged: () => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("manual");
  const [manualName, setManualName] = useState("");
  const [manualType, setManualType] = useState<InvitationType>("day");
  const [manualGuests, setManualGuests] = useState("");
  const [preview, setPreview] = useState<ImportHousehold[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<InvitationType>("day");
  const [editGuests, setEditGuests] = useState<
    Array<{ id?: string; fullName: string; attending: boolean | null }>
  >([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const existingNames = useMemo(
    () => new Set(households.map((household) => household.invitationName.toLowerCase())),
    [households],
  );

  async function importHouseholds(items: ImportHousehold[]) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ households: items }),
      });
      const data = (await response.json()) as {
        error?: string;
        imported?: { households?: number; guests?: number };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to add the guests.");
      }

      setSuccess(
        `${data.imported?.guests ?? 0} guests added across ${data.imported?.households ?? 0} invitations.`,
      );
      setManualName("");
      setManualType("day");
      setManualGuests("");
      setPreview([]);
      setFileName("");
      await onChanged();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to add the guests.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addManually(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guests = manualGuests
      .split("\n")
      .map((guest) => guest.trim())
      .filter(Boolean);

    if (!manualName.trim() || guests.length === 0) {
      setError("Add an invitation name and at least one guest.");
      return;
    }

    await importHouseholds([
      {
        invitationName: manualName.trim(),
        invitationType: manualType,
        guests,
      },
    ]);
  }

  async function readCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.name.toLowerCase().endsWith(".csv") || file.size > 2_000_000) {
      setError("Choose a CSV file smaller than 2 MB.");
      return;
    }

    try {
      const items = buildImportPreview(await file.text());
      const duplicate = items.find((item) =>
        existingNames.has(item.invitationName.toLowerCase()),
      );

      if (duplicate) {
        throw new Error(
          `${duplicate.invitationName} already exists in the dashboard.`,
        );
      }

      setPreview(items);
      setFileName(file.name);
    } catch (parseError) {
      setPreview([]);
      setFileName("");
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Unable to read the CSV.",
      );
    }
  }

  function selectHousehold(id: string) {
    setSelectedId(id);
    setError("");
    setSuccess("");
    const household = households.find((item) => item.id === id);

    if (!household) {
      setEditName("");
      setEditGuests([]);
      return;
    }

    setEditName(household.invitationName);
    setEditType(household.invitationType);
    setEditGuests(
      household.guests.map((guest) => ({
        id: guest.id,
        fullName: guest.fullName,
        attending: guest.attending,
      })),
    );
  }

  async function saveHousehold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !editName.trim() || editGuests.some((guest) => !guest.fullName.trim())) {
      setError("Every invitation and guest needs a name.");
      return;
    }

    const originalHousehold = households.find(
      (household) => household.id === selectedId,
    );
    const retainedIds = new Set(
      editGuests.map((guest) => guest.id).filter(Boolean),
    );
    const removesRespondedGuest = originalHousehold?.guests.some(
      (guest) =>
        !retainedIds.has(guest.id) && guest.attending !== null,
    );

    if (
      removesRespondedGuest &&
      !window.confirm(
        "This removes a guest who has already responded and will change your RSVP totals. Continue?",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          invitationName: editName,
          invitationType: editType,
          guests: editGuests,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update the invitation.");
      }

      setSuccess("Invitation updated.");
      await onChanged();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update the invitation.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteHousehold() {
    const household = households.find((item) => item.id === selectedId);
    if (!household) return;

    if (
      !window.confirm(
        `Delete “${household.invitationName}” and all guests on that invitation? This cannot be undone.`,
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/guests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdId: selectedId }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete the invitation.");
      }

      setSelectedId("");
      setEditName("");
      setEditGuests([]);
      setSuccess("Invitation deleted.");
      await onChanged();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the invitation.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="guest-management" className="scroll-mt-28 border-t border-[#ded9cf] pt-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-[#A97A3D]">
          Guest Management
        </p>
        <h2 className="mt-4 font-serif text-4xl md:text-6xl">
          Invitations made simple
        </h2>
        <p className="mt-6 text-sm leading-8 text-neutral-600">
          Add a single invitation, upload your full guest list, or correct an
          existing household.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3" role="tablist" aria-label="Guest management options">
        {([
          ["manual", "Add Manually"],
          ["upload", "Upload Guest List"],
          ["manage", "Manage Existing"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            aria-controls={`guest-panel-${value}`}
            onClick={() => {
              setMode(value);
              setError("");
              setSuccess("");
            }}
            className={`rounded-full border px-5 py-3 text-[10px] uppercase tracking-[0.23em] transition ${
              mode === value
                ? "border-[#A97A3D] bg-[#A97A3D] text-white"
                : "border-[#cfc8bb] text-neutral-600 hover:border-[#A97A3D] hover:text-[#A97A3D]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(error || success) && (
        <div
          role={error ? "alert" : "status"}
          className={`mt-8 border px-5 py-4 text-sm ${
            error
              ? "border-red-200 text-red-700"
              : "border-green-700/20 text-green-800"
          }`}
        >
          {error || success}
        </div>
      )}

      {mode === "manual" && (
        <form
          id="guest-panel-manual"
          role="tabpanel"
          onSubmit={addManually}
          className="mt-10 grid gap-8 lg:grid-cols-2"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                Invitation name
              </span>
              <input
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
                placeholder="John & Sarah Smith"
                maxLength={160}
                className="w-full border border-[#ded9cf] bg-transparent px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                Invitation type
              </span>
              <select
                value={manualType}
                onChange={(event) => setManualType(event.target.value as InvitationType)}
                className="w-full border border-[#ded9cf] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
              >
                <option value="day">Day invitation</option>
                <option value="evening">Evening invitation</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                Guests—one name per line
              </span>
              <textarea
                value={manualGuests}
                onChange={(event) => setManualGuests(event.target.value)}
                placeholder={"John Smith\nSarah Smith"}
                className="min-h-36 w-full border border-[#ded9cf] bg-transparent px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#A97A3D]"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 w-full rounded-full border border-[#A97A3D] bg-[#A97A3D] px-7 py-4 text-[10px] uppercase tracking-[0.28em] text-white transition hover:bg-transparent hover:text-[#A97A3D] disabled:opacity-50"
            >
              {saving ? "Adding Invitation..." : "Add Invitation"}
            </button>
          </div>
        </form>
      )}

      {mode === "upload" && (
        <div
          id="guest-panel-upload"
          role="tabpanel"
          className="mt-10 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]"
        >
          <div>
            <h3 className="font-serif text-3xl">Upload a CSV</h3>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              Start with our template, complete it in Excel or Numbers, then
              save it as a CSV. Nothing is imported until you approve the preview.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-6 border-b border-[#A97A3D] pb-1 text-[10px] uppercase tracking-[0.24em] text-[#A97A3D]"
            >
              Download template
            </button>

            <label className="mt-8 flex cursor-pointer justify-center rounded-full border border-[#181818] px-7 py-4 text-[10px] uppercase tracking-[0.26em] transition hover:bg-[#181818] hover:text-white">
              Choose CSV File
              <input type="file" accept=".csv,text/csv" onChange={(event) => void readCsv(event)} className="sr-only" />
            </label>
          </div>

          <div className="border-t border-[#ded9cf] pt-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-serif text-2xl">Import preview</h3>
              {fileName && <p className="truncate text-xs text-neutral-500">{fileName}</p>}
            </div>

            {preview.length > 0 ? (
              <>
                <div className="mt-5 max-h-96 divide-y divide-[#ded9cf] overflow-y-auto border-y border-[#ded9cf]">
                  {preview.map((household) => (
                    <article key={household.invitationName} className="py-5">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-serif text-xl">{household.invitationName}</p>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#A97A3D]">
                          {household.invitationType}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600">
                        {household.guests.join(", ")}
                      </p>
                    </article>
                  ))}
                </div>
                <p className="mt-4 text-sm text-neutral-600">
                  {preview.length} invitations · {preview.reduce((total, household) => total + household.guests.length, 0)} guests
                </p>
                <button
                  type="button"
                  onClick={() => void importHouseholds(preview)}
                  disabled={saving}
                  className="mt-5 w-full rounded-full border border-[#A97A3D] bg-[#A97A3D] px-7 py-4 text-[10px] uppercase tracking-[0.28em] text-white transition hover:bg-transparent hover:text-[#A97A3D] disabled:opacity-50"
                >
                  {saving ? "Importing..." : "Approve & Import"}
                </button>
              </>
            ) : (
              <p className="mt-5 text-sm leading-7 text-neutral-500">
                Your households and guests will appear here for checking before anything is saved.
              </p>
            )}
          </div>
        </div>
      )}

      {mode === "manage" && (
        <div
          id="guest-panel-manage"
          role="tabpanel"
          className="mt-10 grid gap-10 lg:grid-cols-[0.65fr_1.35fr]"
        >
          <div>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                Choose an invitation
              </span>
              <select
                value={selectedId}
                onChange={(event) => selectHousehold(event.target.value)}
                className="w-full border border-[#ded9cf] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
              >
                <option value="">Select household...</option>
                {households.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.invitationName}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-4 text-sm leading-7 text-neutral-500">
              Editing or removing a guest who has already replied may alter your RSVP totals.
            </p>
          </div>

          {selectedId ? (
            <form onSubmit={saveHousehold} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  aria-label="Invitation name"
                  maxLength={160}
                  className="border border-[#ded9cf] bg-transparent px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                />
                <select
                  value={editType}
                  onChange={(event) => setEditType(event.target.value as InvitationType)}
                  aria-label="Invitation type"
                  className="border border-[#ded9cf] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                >
                  <option value="day">Day invitation</option>
                  <option value="evening">Evening invitation</option>
                </select>
              </div>

              <div className="space-y-3">
                {editGuests.map((guest, index) => (
                  <div key={guest.id ?? `new-${index}`} className="flex gap-3">
                    <input
                      value={guest.fullName}
                      onChange={(event) =>
                        setEditGuests((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, fullName: event.target.value }
                              : item,
                          ),
                        )
                      }
                      aria-label={`Guest ${index + 1} name`}
                      className="min-w-0 flex-1 border border-[#ded9cf] bg-transparent px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
                    />
                    <button
                      type="button"
                      disabled={editGuests.length === 1}
                      onClick={() =>
                        setEditGuests((current) => current.filter((_, itemIndex) => itemIndex !== index))
                      }
                      className="px-3 text-[9px] uppercase tracking-[0.18em] text-red-700 disabled:opacity-30"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditGuests((current) => [
                    ...current,
                    { fullName: "", attending: null },
                  ])
                }
                className="border-b border-[#A97A3D] pb-1 text-[10px] uppercase tracking-[0.22em] text-[#A97A3D]"
              >
                Add another guest
              </button>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full border border-[#A97A3D] bg-[#A97A3D] px-7 py-4 text-[10px] uppercase tracking-[0.25em] text-white transition hover:bg-transparent hover:text-[#A97A3D] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteHousehold()}
                  disabled={saving}
                  className="rounded-full border border-red-700/40 px-7 py-4 text-[10px] uppercase tracking-[0.22em] text-red-700 transition hover:bg-red-700 hover:text-white disabled:opacity-50"
                >
                  Delete Invitation
                </button>
              </div>
            </form>
          ) : (
            <div className="border-y border-[#ded9cf] py-10 text-sm text-neutral-500">
              Select an invitation to edit its household or guests.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
