import { NextResponse } from "next/server";

import { consumeRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PHOTO_FOCUS_START_AT } from "@/lib/wedding-schedule";

const BUCKET = "wedding-photos";
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const MAX_NAME_LENGTH = 80;
const MAX_CAPTION_LENGTH = 240;
const PHOTO_WINDOW_START = new Date(PHOTO_FOCUS_START_AT);
const PHOTO_WINDOW_END = new Date("2026-12-27T00:00:00Z");
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/heic", "heic"],
  ["image/heif", "heif"],
]);

function uploadsAreOpen(request: Request) {
  const now = new Date();
  const url = new URL(request.url);
  const localPreview =
    process.env.NODE_ENV !== "production" &&
    url.searchParams.get("preview") === "photos";
  const previewToken = process.env.PHOTO_PREVIEW_UPLOAD_TOKEN;
  const tokenPreview =
    Boolean(previewToken) &&
    url.searchParams.get("uploadToken") === previewToken;
  let pagePreview = false;

  try {
    const referer = new URL(request.headers.get("referer") ?? "");
    pagePreview =
      url.searchParams.get("preview") === "photos" &&
      referer.origin === url.origin &&
      referer.pathname === "/preview=photos";
  } catch {
    pagePreview = false;
  }

  return (
    localPreview ||
    tokenPreview ||
    pagePreview ||
    (now >= PHOTO_WINDOW_START && now < PHOTO_WINDOW_END)
  );
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("wedding_photos")
    .select("id, storage_path, uploader_name, caption, created_at")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Photo gallery lookup failed:", error);
    return NextResponse.json({ photos: [] });
  }

  const photos = data.map((photo) => ({
    id: photo.id,
    url: supabaseAdmin.storage.from(BUCKET).getPublicUrl(photo.storage_path)
      .data.publicUrl,
    uploaderName: photo.uploader_name,
    caption: photo.caption,
    createdAt: photo.created_at,
  }));

  return NextResponse.json(
    { photos },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!uploadsAreOpen(request)) {
    return NextResponse.json(
      { error: "Photo uploads are not open at the moment." },
      { status: 403 },
    );
  }

  const rateLimit = consumeRateLimit(request, {
    namespace: "photo-upload",
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait a little while and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    );
  }

  try {
    const form = await request.formData();
    const photo = form.get("photo");
    const uploaderName = String(form.get("uploaderName") ?? "").trim();
    const caption = String(form.get("caption") ?? "").trim();

    if (!(photo instanceof File)) {
      return NextResponse.json(
        { error: "Please choose a photograph to upload." },
        { status: 400 },
      );
    }

    const extension = ALLOWED_TYPES.get(photo.type);

    if (!extension || photo.size === 0 || photo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Please choose a JPG, PNG, WebP or HEIC image under 12 MB." },
        { status: 400 },
      );
    }

    if (
      uploaderName.length > MAX_NAME_LENGTH ||
      caption.length > MAX_CAPTION_LENGTH
    ) {
      return NextResponse.json(
        { error: "The name or caption is too long." },
        { status: 400 },
      );
    }

    const storagePath = `2026-12-19/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storagePath, await photo.arrayBuffer(), {
        contentType: photo.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Photo storage upload failed:", uploadError);
      return NextResponse.json(
        { error: "We could not store that photograph. Please try again." },
        { status: 500 },
      );
    }

    const { data, error: insertError } = await supabaseAdmin
      .from("wedding_photos")
      .insert({
        storage_path: storagePath,
        uploader_name: uploaderName || null,
        caption: caption || null,
      })
      .select("id")
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
      console.error("Photo metadata insert failed:", insertError);
      return NextResponse.json(
        { error: "We could not add that photograph to the gallery." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Photo upload failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while uploading the photograph." },
      { status: 500 },
    );
  }
}
