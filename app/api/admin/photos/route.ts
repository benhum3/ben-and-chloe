import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "wedding-photos";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  return null;
}

function validIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 200 &&
    value.every((id) => typeof id === "string" && UUID_PATTERN.test(id))
  );
}

export async function GET() {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const { data, error } = await supabaseAdmin
    .from("wedding_photos")
    .select(
      "id, storage_path, uploader_name, caption, hidden, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Admin photo lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to load the photo library." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    photos: data.map((photo) => ({
      id: photo.id,
      url: supabaseAdmin.storage.from(BUCKET).getPublicUrl(photo.storage_path)
        .data.publicUrl,
      uploaderName: photo.uploader_name,
      caption: photo.caption,
      hidden: photo.hidden,
      createdAt: photo.created_at,
    })),
  });
}

export async function PATCH(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { ids?: unknown; hidden?: unknown };

  if (!validIds(body.ids) || typeof body.hidden !== "boolean") {
    return NextResponse.json(
      { error: "Invalid photo update." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("wedding_photos")
    .update({ hidden: body.hidden })
    .in("id", body.ids);

  if (error) {
    console.error("Admin photo visibility update failed:", error);
    return NextResponse.json(
      { error: "Unable to update photo visibility." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const unauthorised = await requireAdmin();
  if (unauthorised) return unauthorised;

  const body = (await request.json()) as { ids?: unknown };

  if (!validIds(body.ids)) {
    return NextResponse.json(
      { error: "Invalid photo selection." },
      { status: 400 },
    );
  }

  const { data: photos, error: lookupError } = await supabaseAdmin
    .from("wedding_photos")
    .select("id, storage_path")
    .in("id", body.ids);

  if (lookupError || !photos || photos.length !== body.ids.length) {
    console.error("Admin photo deletion lookup failed:", lookupError);
    return NextResponse.json(
      { error: "Unable to find every selected photo." },
      { status: 404 },
    );
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove(photos.map((photo) => photo.storage_path));

  if (storageError) {
    console.error("Admin photo storage deletion failed:", storageError);
    return NextResponse.json(
      { error: "Unable to delete the stored photo." },
      { status: 500 },
    );
  }

  const { error: deleteError } = await supabaseAdmin
    .from("wedding_photos")
    .delete()
    .in("id", body.ids);

  if (deleteError) {
    console.error("Admin photo metadata deletion failed:", deleteError);
    return NextResponse.json(
      { error: "The file was removed, but its gallery record remains." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
