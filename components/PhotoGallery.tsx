"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import Container from "./Container";

type PhotoPhase = "hidden" | "upcoming" | "open" | "gallery";

type GalleryPhoto = {
  id: string;
  url: string;
  uploaderName: string | null;
  caption: string | null;
  createdAt: string;
};

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

const PHOTO_WINDOW_START = new Date("2026-12-19T00:00:00Z");
const PHOTO_WINDOW_END = new Date("2026-12-27T00:00:00Z");
const PHOTO_TEASER_START = new Date("2026-12-12T00:00:00Z");
const MAX_SELECTION = 10;

const previewPhotos: GalleryPhoto[] = [
  {
    id: "preview-colour",
    url: "/images/longridge-house.jpg",
    uploaderName: "Gallery preview",
    caption: "Photos shared on the day will appear here.",
    createdAt: "2026-12-19T14:00:00Z",
  },
  {
    id: "preview-black-white",
    url: "/images/longridge-house-bw.jpg",
    uploaderName: "Gallery preview",
    caption: "Tap any photograph to see it full size.",
    createdAt: "2026-12-19T14:01:00Z",
  },
];

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

function getPhotoPhase(): PhotoPhase {
  if (new URLSearchParams(window.location.search).get("preview") === "photos") {
    return "open";
  }

  const now = new Date();

  if (now >= PHOTO_WINDOW_END) return "gallery";
  if (now >= PHOTO_WINDOW_START) return "open";
  if (now >= PHOTO_TEASER_START) return "upcoming";
  return "hidden";
}

function getServerPhotoPhase(): PhotoPhase {
  return "hidden";
}

export default function PhotoGallery() {
  const phase = useSyncExternalStore(
    subscribeToClock,
    getPhotoPhase,
    getServerPhotoPhase,
  );
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/photos", { cache: "no-store" });
      const data = (await response.json()) as {
        photos?: GalleryPhoto[];
      };

      if (response.ok) {
        setPhotos(data.photos ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.photoPhase = phase;

    return () => {
      delete document.documentElement.dataset.photoPhase;
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "hidden") return;

    const timer = window.setTimeout(() => {
      void loadPhotos();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadPhotos, phase]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const remaining = MAX_SELECTION - selectedPhotos.length;
    const nextFiles = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remaining)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));

    setSelectedPhotos((current) => [...current, ...nextFiles]);
    setMessage("");
  }

  function removeSelectedPhoto(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    setSelectedPhotos((current) =>
      current.filter((photo) => photo.previewUrl !== previewUrl),
    );
  }

  async function uploadPhotos() {
    if (selectedPhotos.length === 0 || uploading) return;

    setUploading(true);
    setMessage("");

    try {
      for (const selectedPhoto of selectedPhotos) {
        const body = new FormData();
        body.set("photo", selectedPhoto.file);
        body.set("uploaderName", uploaderName.trim());
        body.set("caption", caption.trim());

        const previewQuery =
          new URLSearchParams(window.location.search).get("preview") === "photos"
            ? "?preview=photos"
            : "";
        const response = await fetch(`/api/photos${previewQuery}`, {
          method: "POST",
          body,
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "A photo could not be uploaded.");
        }
      }

      selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setSelectedPhotos([]);
      setCaption("");
      setMessage(
        selectedPhotos.length === 1
          ? "Your photo is now in the gallery. Thank you!"
          : "Your photos are now in the gallery. Thank you!",
      );
      await loadPhotos();
    } catch (uploadError) {
      setMessage(
        uploadError instanceof Error
          ? uploadError.message
          : "We could not upload your photos. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (phase === "hidden") return null;

  const galleryPhotos =
    phase === "open" &&
    new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.search,
    ).get("preview") === "photos" &&
    photos.length === 0
      ? previewPhotos
      : photos;

  return (
    <section
      id="photos"
      data-gold-theme="dark"
      className="scroll-mt-28 bg-[#181818] pb-20 pt-32 text-[#f8f6f2] md:pb-28 md:pt-40"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--gold-text)] md:text-[11px]">
              Through your eyes
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.05] md:mt-6 md:text-7xl">
              Share your photos
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-neutral-400 md:mt-8 md:text-sm">
              Capture a favourite moment or choose photographs from your phone.
              Photos are added straight to the shared gallery for everyone to
              enjoy.
            </p>
          </div>

          {phase === "upcoming" ? (
            <div className="border-t border-white/15 pt-7">
              <p className="font-serif text-3xl md:text-4xl">
                Photo sharing opens on the wedding day.
              </p>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                Come back from 19 December to take a photo, upload your
                favourites and enjoy the shared gallery.
              </p>
            </div>
          ) : (
            <div>
              {phase === "open" && (
                <div className="border border-white/15 bg-white/[0.03] p-5 md:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="min-h-12 flex-1 rounded-full border border-[#d2a641] bg-[#d2a641] px-6 py-3 text-[10px] uppercase tracking-[0.26em] text-[#181818] transition hover:bg-transparent hover:text-[var(--gold-text)]"
                    >
                      Take a photo
                    </button>
                    <button
                      type="button"
                      onClick={() => libraryInputRef.current?.click()}
                      className="min-h-12 flex-1 rounded-full border border-[#d2a641] px-6 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--gold-text)] transition hover:bg-[#d2a641] hover:text-[#181818]"
                    >
                      Choose photos
                    </button>
                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(event) => {
                      addFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />
                  <input
                    ref={libraryInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      addFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />

                  {selectedPhotos.length > 0 && (
                    <div className="mt-7">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                        Ready to share · {selectedPhotos.length} of {MAX_SELECTION}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {selectedPhotos.map((photo) => (
                          <div
                            key={photo.previewUrl}
                            className="relative aspect-square overflow-hidden bg-neutral-800"
                          >
                            <Image
                              src={photo.previewUrl}
                              alt="Selected photo preview"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                            <button
                              type="button"
                              aria-label="Remove selected photo"
                              onClick={() => removeSelectedPhoto(photo.previewUrl)}
                              className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-[#181818]/85 text-xl"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
                          Your name · optional
                          <input
                            type="text"
                            maxLength={80}
                            value={uploaderName}
                            onChange={(event) => setUploaderName(event.target.value)}
                            className="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-base normal-case tracking-normal text-white outline-none transition focus:border-[#d2a641]"
                          />
                        </label>
                        <label className="text-[10px] uppercase tracking-[0.24em] text-neutral-400">
                          Caption · optional
                          <input
                            type="text"
                            maxLength={240}
                            value={caption}
                            onChange={(event) => setCaption(event.target.value)}
                            className="mt-2 w-full border border-white/20 bg-transparent px-4 py-3 text-base normal-case tracking-normal text-white outline-none transition focus:border-[#d2a641]"
                          />
                        </label>
                      </div>

                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => void uploadPhotos()}
                        className="mt-5 min-h-12 w-full rounded-full border border-[#d2a641] bg-[#d2a641] px-6 py-3 text-[10px] uppercase tracking-[0.26em] text-[#181818] transition enabled:hover:bg-transparent enabled:hover:text-[var(--gold-text)] disabled:cursor-wait disabled:opacity-60"
                      >
                        {uploading ? "Sharing photos…" : "Share with everyone"}
                      </button>
                    </div>
                  )}

                  {message && (
                    <p className="mt-5 text-sm leading-7 text-neutral-300" role="status">
                      {message}
                    </p>
                  )}
                </div>
              )}

              <div className={phase === "open" ? "mt-12" : ""}>
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-text)]">
                      Shared gallery
                    </p>
                    <h3 className="mt-3 font-serif text-3xl md:text-4xl">
                      Moments from the day
                    </h3>
                  </div>
                  {galleryPhotos.length > 0 && (
                    <p className="text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                      {galleryPhotos.length} {galleryPhotos.length === 1 ? "photo" : "photos"}
                    </p>
                  )}
                </div>

                {loading ? (
                  <p className="mt-8 text-sm text-neutral-500">Loading photographs…</p>
                ) : galleryPhotos.length === 0 ? (
                  <div className="mt-8 border border-dashed border-white/15 px-6 py-14 text-center">
                    <p className="font-serif text-2xl text-neutral-300">
                      The first photograph is waiting to be shared.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {galleryPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setActivePhoto(photo)}
                        className="group relative aspect-square overflow-hidden bg-neutral-800 text-left"
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption || "Wedding photograph"}
                          fill
                          unoptimized
                          sizes="(min-width: 768px) 25vw, 50vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                        {(photo.caption || photo.uploaderName) && (
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12 text-sm">
                            {photo.caption || `Shared by ${photo.uploaderName}`}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>

      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photograph preview"
          className="fixed inset-0 z-[80] grid place-items-center bg-black/95 p-4 md:p-10"
          onClick={() => setActivePhoto(null)}
        >
          <button
            type="button"
            aria-label="Close photograph"
            onClick={() => setActivePhoto(null)}
            className="absolute right-5 top-5 z-10 min-h-11 px-3 text-3xl font-light text-white"
          >
            ×
          </button>
          <div
            className="relative h-full max-h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activePhoto.url}
              alt={activePhoto.caption || "Wedding photograph"}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
