"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const categories = [
  "General",
  "Venue",
  "Guests",
  "Suppliers",
  "Stationery",
  "Outfits",
] as const;

type PlanningTask = {
  id: string;
  title: string;
  category: (typeof categories)[number];
  due_date: string | null;
  notes: string;
  completed: boolean;
  created_at: string;
};

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function PlanningTasks() {
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("General");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/admin/tasks", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          tasks?: PlanningTask[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load planning tasks.");
        }

        setTasks(data.tasks ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load planning tasks.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const visibleTasks = useMemo(
    () => tasks.filter((task) => showCompleted || !task.completed),
    [showCompleted, tasks],
  );

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, dueDate, notes }),
      });
      const data = (await response.json()) as {
        task?: PlanningTask;
        error?: string;
      };

      if (!response.ok || !data.task) {
        throw new Error(data.error ?? "Unable to add the task.");
      }

      setTasks((current) => [data.task!, ...current]);
      setTitle("");
      setCategory("General");
      setDueDate("");
      setNotes("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to add the task.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: PlanningTask) {
    setError("");

    const response = await fetch("/api/admin/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, completed: !task.completed }),
    });
    const data = (await response.json()) as {
      task?: PlanningTask;
      error?: string;
    };

    if (!response.ok || !data.task) {
      setError(data.error ?? "Unable to update the task.");
      return;
    }

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? data.task! : item)),
    );
  }

  async function deleteTask(task: PlanningTask) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;

    setError("");
    const response = await fetch("/api/admin/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id }),
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Unable to delete the task.");
      return;
    }

    setTasks((current) => current.filter((item) => item.id !== task.id));
  }

  return (
    <section id="planning" className="scroll-mt-28 border-t border-[#ded9cf] pt-16">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#A97A3D]">
            Wedding Planning
          </p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">
            Your shared checklist
          </h2>

          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{completedCount} of {tasks.length} complete</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden bg-[#ded9cf]">
              <div
                className="h-full bg-[#A97A3D] transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={addTask} className="mt-10 space-y-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="Task title"
              placeholder="Add a planning task"
              maxLength={160}
              className="w-full border border-[#ded9cf] bg-white/20 px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={category}
                aria-label="Task category"
                onChange={(event) =>
                  setCategory(event.target.value as typeof category)
                }
                className="border border-[#ded9cf] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <input
                type="date"
                value={dueDate}
                aria-label="Task due date"
                onChange={(event) => setDueDate(event.target.value)}
                className="border border-[#ded9cf] bg-[#f8f6f2] px-5 py-4 text-sm outline-none transition focus:border-[#A97A3D]"
              />
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              aria-label="Task notes"
              placeholder="Notes (optional)"
              maxLength={1000}
              className="min-h-24 w-full border border-[#ded9cf] bg-white/20 px-5 py-4 text-sm leading-7 outline-none transition focus:border-[#A97A3D]"
            />

            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="w-full rounded-full border border-[#A97A3D] bg-[#A97A3D] px-7 py-4 text-[10px] uppercase tracking-[0.28em] text-white transition duration-300 hover:bg-transparent hover:text-[#A97A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Adding Task..." : "Add Task"}
            </button>
          </form>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-[#ded9cf] pb-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              {tasks.length - completedCount} tasks remaining
            </p>
            <button
              type="button"
              onClick={() => setShowCompleted((current) => !current)}
              className="text-[10px] uppercase tracking-[0.24em] text-[#A97A3D]"
            >
              {showCompleted ? "Hide completed" : "Show completed"}
            </button>
          </div>

          {error && (
            <p role="alert" className="border-b border-red-200 py-5 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="py-10 text-sm text-neutral-500">Loading tasks...</p>
          ) : visibleTasks.length > 0 ? (
            <div className="divide-y divide-[#ded9cf]">
              {visibleTasks.map((task) => (
                <article key={task.id} className="flex gap-4 py-6">
                  <button
                    type="button"
                    onClick={() => void toggleTask(task)}
                    aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                    aria-pressed={task.completed}
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                      task.completed
                        ? "border-[#A97A3D] bg-[#A97A3D] text-white"
                        : "border-[#bdb5a8] text-transparent hover:border-[#A97A3D]"
                    }`}
                  >
                    ✓
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={`font-serif text-xl ${task.completed ? "text-neutral-400 line-through" : ""}`}>
                          {task.title}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[#A97A3D]">
                          {task.category}
                          {task.due_date ? ` · ${formatDueDate(task.due_date)}` : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void deleteTask(task)}
                        className="self-start text-[9px] uppercase tracking-[0.2em] text-neutral-400 transition hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    {task.notes && (
                      <p className="mt-3 text-sm leading-7 text-neutral-600">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-10 text-sm leading-7 text-neutral-500">
              {tasks.length ? "All visible tasks are complete." : "Add your first planning task to get started."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
