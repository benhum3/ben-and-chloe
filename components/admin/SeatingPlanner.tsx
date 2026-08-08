"use client";

import {
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type InvitationType = "day" | "evening";

export type SeatingPlannerGuest = {
  id: string;
  fullName: string;
  householdId: string;
  householdName: string;
  invitationType: InvitationType;
  attending: boolean | null;
  dietaryRequirements: string | null;
};

type SeatingTable = {
  id: string;
  name: string;
  capacity: number;
  sortOrder: number;
};

type Assignment = {
  guestId: string;
  tableId: string;
};

type SuggestedPlan = {
  assignments: Record<string, string>;
  splitHouseholds: string[];
  unassignedCount: number;
};

const DEFAULT_TABLE_CAPACITY = 10;

function buildSuggestedPlan(
  guests: SeatingPlannerGuest[],
  tables: SeatingTable[],
): SuggestedPlan {
  const remainingSeats = new Map(
    tables.map((table) => [table.id, table.capacity]),
  );
  const householdGroups = new Map<string, SeatingPlannerGuest[]>();

  guests.forEach((guest) => {
    const household = householdGroups.get(guest.householdId) ?? [];
    household.push(guest);
    householdGroups.set(guest.householdId, household);
  });

  const groups = Array.from(householdGroups.values()).sort(
    (left, right) =>
      right.length - left.length ||
      left[0].householdName.localeCompare(right[0].householdName),
  );
  const assignments: Record<string, string> = {};
  const splitHouseholds: string[] = [];

  groups.forEach((group) => {
    const wholeHouseholdTable = tables
      .filter((table) => (remainingSeats.get(table.id) ?? 0) >= group.length)
      .sort((left, right) => {
        const leftAfter = (remainingSeats.get(left.id) ?? 0) - group.length;
        const rightAfter = (remainingSeats.get(right.id) ?? 0) - group.length;
        return leftAfter - rightAfter || left.sortOrder - right.sortOrder;
      })[0];

    if (wholeHouseholdTable) {
      group.forEach((guest) => {
        assignments[guest.id] = wholeHouseholdTable.id;
      });
      remainingSeats.set(
        wholeHouseholdTable.id,
        (remainingSeats.get(wholeHouseholdTable.id) ?? 0) - group.length,
      );
      return;
    }

    const usedTableIds = new Set<string>();
    let nextGuestIndex = 0;

    while (nextGuestIndex < group.length) {
      const tableWithMostSpace = tables
        .filter((table) => (remainingSeats.get(table.id) ?? 0) > 0)
        .sort((left, right) => {
          const spaceDifference =
            (remainingSeats.get(right.id) ?? 0) -
            (remainingSeats.get(left.id) ?? 0);
          return spaceDifference || left.sortOrder - right.sortOrder;
        })[0];

      if (!tableWithMostSpace) break;

      const available = remainingSeats.get(tableWithMostSpace.id) ?? 0;
      const guestsForTable = group.slice(
        nextGuestIndex,
        nextGuestIndex + available,
      );

      guestsForTable.forEach((guest) => {
        assignments[guest.id] = tableWithMostSpace.id;
      });
      usedTableIds.add(tableWithMostSpace.id);
      remainingSeats.set(
        tableWithMostSpace.id,
        available - guestsForTable.length,
      );
      nextGuestIndex += guestsForTable.length;
    }

    if (usedTableIds.size > 1) {
      splitHouseholds.push(group[0].householdName);
    }
  });

  return {
    assignments,
    splitHouseholds,
    unassignedCount:
      guests.length - Object.keys(assignments).length,
  };
}

function escapeCsv(value: string | number) {
  const rawText = String(value);
  const text = /^[=+\-@\t\r]/.test(rawText) ? `'${rawText}` : rawText;
  return `"${text.replaceAll('"', '""')}"`;
}

function GuestCard({
  guest,
  tableId,
  tables,
  onAssign,
}: {
  guest: SeatingPlannerGuest;
  tableId: string | null;
  tables: SeatingTable[];
  onAssign: (guestId: string, tableId: string | null) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", guest.id);
      }}
      className="cursor-grab border border-[#ded9cf] bg-[#f8f6f2] p-4 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-lg leading-tight">{guest.fullName}</p>
          <p className="mt-1 truncate text-[9px] uppercase tracking-[0.18em] text-neutral-500">
            {guest.householdName}
          </p>
        </div>
        <span aria-hidden="true" className="text-neutral-300">
          ⋮⋮
        </span>
      </div>

      {guest.dietaryRequirements?.trim() && (
        <p className="mt-3 text-xs leading-5 text-[var(--gold-text)]">
          {guest.dietaryRequirements.trim()}
        </p>
      )}

      <label className="mt-3 block">
        <span className="sr-only">Table for {guest.fullName}</span>
        <select
          value={tableId ?? ""}
          onChange={(event) =>
            onAssign(guest.id, event.target.value || null)
          }
          className="w-full border border-[#ded9cf] bg-[#f8f6f2] px-3 py-2 text-xs outline-none transition focus:border-[#d2a641]"
        >
          <option value="">Unassigned</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>
      </label>
    </article>
  );
}

export default function SeatingPlanner({
  guests,
}: {
  guests: SeatingPlannerGuest[];
}) {
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(
    DEFAULT_TABLE_CAPACITY,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const eligibleGuests = useMemo(
    () =>
      guests
        .filter(
          (guest) =>
            guest.attending === true && guest.invitationType === "day",
        )
        .sort(
          (left, right) =>
            left.householdName.localeCompare(right.householdName) ||
            left.fullName.localeCompare(right.fullName),
        ),
    [guests],
  );
  const eligibleGuestIds = useMemo(
    () => new Set(eligibleGuests.map((guest) => guest.id)),
    [eligibleGuests],
  );

  const loadPlan = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/seating", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        tables?: SeatingTable[];
        assignments?: Assignment[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load the table plan.");
      }

      setTables(data.tables ?? []);
      setAssignments(
        Object.fromEntries(
          (data.assignments ?? [])
            .filter((assignment) => eligibleGuestIds.has(assignment.guestId))
            .map((assignment) => [assignment.guestId, assignment.tableId]),
        ),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the table plan.",
      );
    } finally {
      setLoading(false);
    }
  }, [eligibleGuestIds]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPlan();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPlan]);

  const tableGuests = useMemo(() => {
    const grouped = new Map<string, SeatingPlannerGuest[]>();

    tables.forEach((table) => grouped.set(table.id, []));
    eligibleGuests.forEach((guest) => {
      const tableId = assignments[guest.id];
      if (tableId && grouped.has(tableId)) {
        grouped.get(tableId)!.push(guest);
      }
    });

    return grouped;
  }, [assignments, eligibleGuests, tables]);

  const unassignedGuests = useMemo(
    () =>
      eligibleGuests.filter(
        (guest) => !tables.some((table) => table.id === assignments[guest.id]),
      ),
    [assignments, eligibleGuests, tables],
  );
  const assignedCount = eligibleGuests.length - unassignedGuests.length;
  const totalCapacity = tables.reduce(
    (total, table) => total + table.capacity,
    0,
  );
  const overCapacityTables = tables.filter(
    (table) => (tableGuests.get(table.id)?.length ?? 0) > table.capacity,
  );

  async function createTables(
    inputs: Array<{ name: string; capacity: number }>,
  ) {
    const response = await fetch("/api/admin/seating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables: inputs }),
    });
    const data = (await response.json()) as {
      tables?: SeatingTable[];
      error?: string;
    };

    if (!response.ok || !data.tables) {
      throw new Error(data.error ?? "Unable to add the table.");
    }

    const nextTables = [...tables, ...data.tables].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );
    setTables(nextTables);
    return nextTables;
  }

  async function addTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTableName.trim()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createTables([
        { name: newTableName.trim(), capacity: newTableCapacity },
      ]);
      setNewTableName("");
      setSuccess("Table added.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to add the table.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function createStarterLayout() {
    if (eligibleGuests.length === 0) {
      setError("There are no confirmed day guests to seat yet.");
      return null;
    }

    const tableCount = Math.max(
      1,
      Math.ceil(eligibleGuests.length / DEFAULT_TABLE_CAPACITY),
    );
    const starterTables = Array.from({ length: tableCount }, (_, index) => ({
      name: `Table ${index + 1}`,
      capacity: DEFAULT_TABLE_CAPACITY,
    }));

    return createTables(starterTables);
  }

  async function suggestPlan() {
    if (eligibleGuests.length === 0) {
      setError("There are no confirmed day guests to seat yet.");
      return;
    }

    if (
      assignedCount > 0 &&
      !window.confirm(
        "Create a fresh suggestion? This will replace the current guest assignments.",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const activeTables = tables.length ? tables : await createStarterLayout();
      if (!activeTables) return;

      const suggestion = buildSuggestedPlan(eligibleGuests, activeTables);
      const suggestedAssignments = Object.entries(suggestion.assignments).map(
        ([guestId, tableId]) => ({ guestId, tableId }),
      );
      const response = await fetch("/api/admin/seating", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: suggestedAssignments }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save the suggested plan.");
      }

      setAssignments(suggestion.assignments);

      const notes = [
        suggestion.unassignedCount
          ? `${suggestion.unassignedCount} guest${suggestion.unassignedCount === 1 ? " is" : "s are"} still unassigned`
          : "every confirmed day guest has a table",
        suggestion.splitHouseholds.length
          ? `${suggestion.splitHouseholds.length} household${suggestion.splitHouseholds.length === 1 ? " was" : "s were"} split to fit`
          : "households were kept together",
      ];
      setSuccess(`Suggestion saved: ${notes.join(" and ")}.`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to suggest a table plan.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function assignGuest(guestId: string, tableId: string | null) {
    const previousTableId = assignments[guestId] ?? null;
    setAssignments((current) => {
      const next = { ...current };
      if (tableId) next[guestId] = tableId;
      else delete next[guestId];
      return next;
    });
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/seating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assignGuest", guestId, tableId }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to move the guest.");
      }
    } catch (saveError) {
      setAssignments((current) => {
        const next = { ...current };
        if (previousTableId) next[guestId] = previousTableId;
        else delete next[guestId];
        return next;
      });
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to move the guest.",
      );
    }
  }

  async function saveTable(table: SeatingTable) {
    if (!table.name.trim()) {
      setError("Every table needs a name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/seating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateTable",
          id: table.id,
          name: table.name,
          capacity: table.capacity,
        }),
      });
      const data = (await response.json()) as {
        table?: SeatingTable;
        error?: string;
      };

      if (!response.ok || !data.table) {
        throw new Error(data.error ?? "Unable to update the table.");
      }

      setTables((current) =>
        current.map((item) => (item.id === table.id ? data.table! : item)),
      );
      setSuccess(`${data.table.name} updated.`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update the table.",
      );
      await loadPlan();
    } finally {
      setSaving(false);
    }
  }

  async function deleteTable(table: SeatingTable) {
    const guestCount = tableGuests.get(table.id)?.length ?? 0;
    const warning = guestCount
      ? `Delete ${table.name}? Its ${guestCount} guest${guestCount === 1 ? "" : "s"} will become unassigned.`
      : `Delete ${table.name}?`;

    if (!window.confirm(warning)) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/seating", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: table.id }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete the table.");
      }

      setTables((current) => current.filter((item) => item.id !== table.id));
      setAssignments((current) =>
        Object.fromEntries(
          Object.entries(current).filter(
            ([, assignedTableId]) => assignedTableId !== table.id,
          ),
        ),
      );
      setSuccess(`${table.name} deleted.`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to delete the table.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
    tableId: string | null,
  ) {
    event.preventDefault();
    const guestId = event.dataTransfer.getData("text/plain");
    if (eligibleGuestIds.has(guestId)) {
      void assignGuest(guestId, tableId);
    }
  }

  function downloadPlan() {
    const tableOrder = new Map(
      tables.map((table, index) => [table.id, index]),
    );
    const rows = eligibleGuests
      .map((guest) => {
        const tableId = assignments[guest.id];
        const table = tables.find((item) => item.id === tableId);
        return {
          tableName: table?.name ?? "Unassigned",
          tableOrder: table ? (tableOrder.get(table.id) ?? 0) : tables.length,
          guest,
        };
      })
      .sort(
        (left, right) =>
          left.tableOrder - right.tableOrder ||
          left.guest.fullName.localeCompare(right.guest.fullName),
      );
    const csv = [
      ["Table", "Guest", "Household", "Dietary requirements"],
      ...rows.map((row) => [
        row.tableName,
        row.guest.fullName,
        row.guest.householdName,
        row.guest.dietaryRequirements?.trim() || "None provided",
      ]),
    ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wedding-table-plan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="tables" className="scroll-mt-28 border-t border-[#ded9cf] pt-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--gold-text)]">
            Wedding Breakfast
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">
            Your table plan
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
            Create a starting suggestion from confirmed day guests, then drag
            guests or use the table menus to make it your own.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={downloadPlan}
            disabled={eligibleGuests.length === 0}
            className="rounded-full border border-[#181818] px-6 py-3 text-[10px] uppercase tracking-[0.22em] transition hover:bg-[#181818] hover:text-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => void suggestPlan()}
            disabled={saving || loading || eligibleGuests.length === 0}
            className="rounded-full border border-[#d2a641] bg-[#d2a641] px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-[#181818] transition hover:bg-transparent hover:text-[var(--gold-text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : assignedCount ? "New Suggestion" : "Suggest Plan"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Confirmed day guests", eligibleGuests.length],
          ["Assigned", assignedCount],
          ["Unassigned", unassignedGuests.length],
          ["Available seats", Math.max(totalCapacity - assignedCount, 0)],
        ].map(([label, value]) => (
          <div key={label} className="border border-[#ded9cf] p-5 text-center">
            <p className="font-serif text-3xl">{value}</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-neutral-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div aria-live="polite" className="mt-6">
        {error && (
          <p role="alert" className="border border-red-200 px-5 py-4 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="border border-[#d2a641]/50 px-5 py-4 text-sm text-neutral-700">
            {success}
          </p>
        )}
        {overCapacityTables.length > 0 && (
          <p className="border border-amber-300 px-5 py-4 text-sm text-amber-900">
            {overCapacityTables.map((table) => table.name).join(", ")} {overCapacityTables.length === 1 ? "is" : "are"} over capacity.
          </p>
        )}
      </div>

      {loading ? (
        <p className="py-12 text-sm text-neutral-500">Loading table plan...</p>
      ) : (
        <>
          <form
            onSubmit={addTable}
            className="mt-10 grid gap-3 border-y border-[#ded9cf] py-6 sm:grid-cols-[1fr_8rem_auto]"
          >
            <input
              value={newTableName}
              onChange={(event) => setNewTableName(event.target.value)}
              placeholder={`Table ${tables.length + 1}`}
              aria-label="New table name"
              maxLength={80}
              className="border border-[#ded9cf] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[#d2a641]"
            />
            <input
              type="number"
              min={1}
              max={30}
              value={newTableCapacity}
              onChange={(event) =>
                setNewTableCapacity(Number(event.target.value))
              }
              aria-label="New table capacity"
              className="border border-[#ded9cf] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[#d2a641]"
            />
            <button
              type="submit"
              disabled={saving || !newTableName.trim()}
              className="border border-[#181818] px-5 py-3 text-[10px] uppercase tracking-[0.22em] transition hover:bg-[#181818] hover:text-[#f8f6f2] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Table
            </button>
          </form>

          {tables.length === 0 ? (
            <div className="mt-10 border border-[#ded9cf] px-6 py-12 text-center">
              <p className="font-serif text-3xl">Ready when you are</p>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-neutral-600">
                Suggest a plan and we’ll create enough ten-seat tables for all
                confirmed day guests, or add your venue’s tables above first.
              </p>
              <button
                type="button"
                onClick={() => void suggestPlan()}
                disabled={saving || eligibleGuests.length === 0}
                className="mt-6 rounded-full border border-[#d2a641] bg-[#d2a641] px-7 py-3 text-[10px] uppercase tracking-[0.24em] text-[#181818] transition hover:bg-transparent hover:text-[var(--gold-text)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Starter Plan
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <section
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, null)}
                className={`border p-5 ${unassignedGuests.length ? "border-[#d2a641]" : "border-[#ded9cf]"}`}
              >
                <div className="flex items-center justify-between border-b border-[#ded9cf] pb-4">
                  <div>
                    <p className="font-serif text-2xl">Unassigned</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                      Drop guests here to remove a table
                    </p>
                  </div>
                  <span className="font-serif text-2xl">
                    {unassignedGuests.length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {unassignedGuests.length ? (
                    unassignedGuests.map((guest) => (
                      <GuestCard
                        key={guest.id}
                        guest={guest}
                        tableId={null}
                        tables={tables}
                        onAssign={(guestId, tableId) =>
                          void assignGuest(guestId, tableId)
                        }
                      />
                    ))
                  ) : (
                    <p className="py-5 text-sm text-neutral-500">
                      Every confirmed day guest has a table.
                    </p>
                  )}
                </div>
              </section>

              {tables.map((table) => {
                const assignedGuests = tableGuests.get(table.id) ?? [];
                const isOverCapacity = assignedGuests.length > table.capacity;

                return (
                  <section
                    key={table.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, table.id)}
                    className={`border p-5 ${isOverCapacity ? "border-amber-400" : "border-[#ded9cf]"}`}
                  >
                    <div className="grid grid-cols-[1fr_5rem] gap-3">
                      <label>
                        <span className="sr-only">Table name</span>
                        <input
                          value={table.name}
                          maxLength={80}
                          onChange={(event) =>
                            setTables((current) =>
                              current.map((item) =>
                                item.id === table.id
                                  ? { ...item, name: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="w-full border-b border-[#ded9cf] bg-transparent pb-2 font-serif text-2xl outline-none focus:border-[#d2a641]"
                        />
                      </label>
                      <label>
                        <span className="block text-[8px] uppercase tracking-[0.16em] text-neutral-500">
                          Seats
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={table.capacity}
                          onChange={(event) =>
                            setTables((current) =>
                              current.map((item) =>
                                item.id === table.id
                                  ? {
                                      ...item,
                                      capacity: Number(event.target.value),
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="mt-1 w-full border-b border-[#ded9cf] bg-transparent pb-2 text-sm outline-none focus:border-[#d2a641]"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className={`text-[10px] uppercase tracking-[0.2em] ${isOverCapacity ? "text-amber-800" : "text-neutral-500"}`}>
                        {assignedGuests.length} of {table.capacity} seats
                      </p>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => void saveTable(table)}
                          disabled={saving || !table.name.trim()}
                          className="text-[9px] uppercase tracking-[0.18em] text-[var(--gold-text)] disabled:opacity-40"
                        >
                          Save details
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteTable(table)}
                          disabled={saving}
                          className="text-[9px] uppercase tracking-[0.18em] text-neutral-400 transition hover:text-red-700 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {assignedGuests.length ? (
                        assignedGuests.map((guest) => (
                          <GuestCard
                            key={guest.id}
                            guest={guest}
                            tableId={table.id}
                            tables={tables}
                            onAssign={(guestId, tableId) =>
                              void assignGuest(guestId, tableId)
                            }
                          />
                        ))
                      ) : (
                        <p className="py-5 text-sm text-neutral-500">
                          Drop guests here or choose this table from their menu.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
