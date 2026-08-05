import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "wedding-photos";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();

type PhotoRow = {
  id: string;
  storage_path: string;
};

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function zipTime(date = new Date()) {
  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    date:
      ((date.getFullYear() - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

function localHeader(name: Uint8Array, size: number, crc: number) {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  const stamp = zipTime();
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, stamp.time, true);
  view.setUint16(12, stamp.date, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, name.length, true);
  return header;
}

function centralHeader(
  name: Uint8Array,
  size: number,
  crc: number,
  offset: number,
) {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  const stamp = zipTime();
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, stamp.time, true);
  view.setUint16(14, stamp.date, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, name.length, true);
  view.setUint32(42, offset, true);
  return header;
}

function endRecord(count: number, directorySize: number, offset: number) {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, count, true);
  view.setUint16(10, count, true);
  view.setUint32(12, directorySize, true);
  view.setUint32(16, offset, true);
  return record;
}

async function getRows(ids?: string[]) {
  let query = supabaseAdmin
    .from("wedding_photos")
    .select("id, storage_path")
    .order("created_at", { ascending: true })
    .limit(500);

  if (ids?.length) query = query.in("id", ids);

  return query;
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  const id = new URL(request.url).searchParams.get("id");

  if (!id || !UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Invalid photo." }, { status: 400 });
  }

  const { data: photo, error } = await supabaseAdmin
    .from("wedding_photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (error || !photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  const { data, error: downloadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(photo.storage_path);

  if (downloadError || !data) {
    return NextResponse.json(
      { error: "Unable to download the photo." },
      { status: 500 },
    );
  }

  const extension = photo.storage_path.split(".").pop() || "jpg";
  return new Response(await data.arrayBuffer(), {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="wedding-photo.${extension}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { ids?: unknown };
  const ids = Array.isArray(body.ids)
    ? body.ids.filter(
        (id): id is string => typeof id === "string" && UUID_PATTERN.test(id),
      )
    : [];

  if (ids.length > 500) {
    return NextResponse.json(
      { error: "Too many photos selected." },
      { status: 400 },
    );
  }

  const { data: photos, error } = await getRows(ids.length ? ids : undefined);

  if (error || !photos?.length) {
    return NextResponse.json(
      { error: "No photos are available to download." },
      { status: 404 },
    );
  }

  const rows = photos as PhotoRow[];
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const centralEntries: Uint8Array[] = [];
      let offset = 0;

      try {
        for (const [index, photo] of rows.entries()) {
          const { data, error: downloadError } = await supabaseAdmin.storage
            .from(BUCKET)
            .download(photo.storage_path);

          if (downloadError || !data) continue;

          const bytes = new Uint8Array(await data.arrayBuffer());
          const extension = photo.storage_path.split(".").pop() || "jpg";
          const name = encoder.encode(
            `wedding-photo-${String(index + 1).padStart(3, "0")}.${extension}`,
          );
          const checksum = crc32(bytes);
          const header = localHeader(name, bytes.length, checksum);
          centralEntries.push(
            centralHeader(name, bytes.length, checksum, offset),
            name,
          );
          controller.enqueue(header);
          controller.enqueue(name);
          controller.enqueue(bytes);
          offset += header.length + name.length + bytes.length;
        }

        const directoryOffset = offset;
        for (const entry of centralEntries) {
          controller.enqueue(entry);
          offset += entry.length;
        }
        controller.enqueue(
          endRecord(
            centralEntries.length / 2,
            offset - directoryOffset,
            directoryOffset,
          ),
        );
        controller.close();
      } catch (streamError) {
        controller.error(streamError);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="wedding-photos.zip"',
      "Cache-Control": "private, no-store",
    },
  });
}
