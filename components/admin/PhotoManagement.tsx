"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type AdminPhoto = {
  id: string;
  url: string;
  uploaderName: string | null;
  caption: string | null;
  hidden: boolean;
  createdAt: string;
};

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function PhotoManagement() {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/photos", { cache: "no-store" });
      const data = (await response.json()) as {
        photos?: AdminPhoto[];
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Unable to load photos.");
      setPhotos(data.photos ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load photos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPhotos(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPhotos]);

  async function setHidden(photo: AdminPhoto, hidden: boolean) {
    setWorkingId(photo.id);
    setError("");

    try {
      const response = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [photo.id], hidden }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to update photo.");
      setPhotos((current) =>
        current.map((item) =>
          item.id === photo.id ? { ...item, hidden } : item,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update photo.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function deletePhoto(photo: AdminPhoto) {
    if (
      !window.confirm(
        "Permanently delete this photo? It cannot be recovered from the website.",
      )
    ) {
      return;
    }

    setWorkingId(photo.id);
    setError("");

    try {
      const response = await fetch("/api/admin/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [photo.id] }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to delete photo.");
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setSelectedIds((current) => current.filter((id) => id !== photo.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete photo.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function downloadBulk() {
    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/photos/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to download photos.");
      }

      saveBlob(await response.blob(), "wedding-photos.zip");
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Unable to download photos.",
      );
    } finally {
      setDownloading(false);
    }
  }

  const allSelected = photos.length > 0 && selectedIds.length === photos.length;

  return (
    <section id="photos" className="scroll-mt-28">
      <div className="flex flex-col gap-6 border-b border-[#e6e2da] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            Photo moderation
          </p>
          <h2 className="mt-3 font-serif text-4xl">Manage the gallery</h2>
          <p className="mt-3 text-sm text-neutral-600">
            {photos.length} {photos.length === 1 ? "photo" : "photos"} · {photos.filter((photo) => photo.hidden).length} hidden
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={photos.length === 0}
            onClick={() =>
              setSelectedIds(allSelected ? [] : photos.map((photo) => photo.id))
            }
            className="border border-[#181818] px-5 py-3 text-[10px] uppercase tracking-[0.22em] transition hover:bg-[#181818] hover:text-white disabled:opacity-40"
          >
            {allSelected ? "Clear selection" : "Select all"}
          </button>
          <button
            type="button"
            disabled={photos.length === 0 || downloading}
            onClick={() => void downloadBulk()}
            className="border border-[#d2a641] bg-[#d2a641] px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-[#181818] transition hover:bg-transparent hover:text-[var(--gold-text)] disabled:opacity-40"
          >
            {downloading
              ? "Preparing ZIP…"
              : selectedIds.length
                ? `Download selected (${selectedIds.length})`
                : "Download all"}
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-700" role="alert">{error}</p>}

      {loading ? (
        <p className="py-12 text-sm text-neutral-500">Loading photos…</p>
      ) : photos.length === 0 ? (
        <div className="mt-8 border border-dashed border-[#d9d3c9] px-6 py-14 text-center">
          <p className="font-serif text-2xl">No photos have been shared yet.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => {
            const selected = selectedIds.includes(photo.id);
            const working = workingId === photo.id;

            return (
              <article
                key={photo.id}
                className={`border p-3 ${
                  selected ? "border-[#d2a641]" : "border-[#ded9cf]"
                } ${photo.hidden ? "bg-neutral-100 opacity-75" : ""}`}
              >
                <label className="relative block aspect-square cursor-pointer overflow-hidden bg-neutral-200">
                  <Image
                    src={photo.url}
                    alt={photo.caption || "Guest wedding photo"}
                    fill
                    unoptimized
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      setSelectedIds((current) =>
                        selected
                          ? current.filter((id) => id !== photo.id)
                          : [...current, photo.id],
                      )
                    }
                    className="absolute left-3 top-3 h-5 w-5 accent-[#d2a641]"
                    aria-label="Select photo"
                  />
                  {photo.hidden && (
                    <span className="absolute right-3 top-3 bg-[#181818] px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white">
                      Hidden
                    </span>
                  )}
                </label>

                <div className="px-1 pb-1 pt-4">
                  <p className="min-h-6 text-sm text-neutral-700">
                    {photo.caption || "No caption"}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {photo.uploaderName || "Anonymous"} · {new Date(photo.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[9px] uppercase tracking-[0.18em]">
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void setHidden(photo, !photo.hidden)}
                      className="border-b border-[#d2a641] pb-1 text-[var(--gold-text)] disabled:opacity-40"
                    >
                      {photo.hidden ? "Show" : "Hide"}
                    </button>
                    <a
                      href={`/api/admin/photos/download?id=${photo.id}`}
                      className="border-b border-neutral-400 pb-1"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => void deletePhoto(photo)}
                      className="border-b border-red-300 pb-1 text-red-700 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
