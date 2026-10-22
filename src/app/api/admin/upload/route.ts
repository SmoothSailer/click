import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";
import { ensureUploadDir, mediaUrl } from "@/lib/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 12;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not read the upload. Please try again." },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No photos were received." }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Upload at most ${MAX_FILES} photos at a time.` },
      { status: 400 },
    );
  }

  const directory = await ensureUploadDir();
  const images: { src: string; thumb: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `"${file.name}" is not a supported image format.` },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `"${file.name}" is larger than 10 MB.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // sharp throws on anything it cannot decode, which keeps non-image
    // files (renamed by mistake) out of the upload folder.
    try {
      await sharp(buffer).metadata();
    } catch {
      return NextResponse.json(
        { error: `"${file.name}" could not be read as an image.` },
        { status: 400 },
      );
    }

    const id = randomUUID();

    const full = await sharp(buffer)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();

    const thumb = await sharp(buffer)
      .rotate()
      .resize({ width: 600, height: 450, fit: "cover", position: "centre" })
      .webp({ quality: 75 })
      .toBuffer();

    await fs.writeFile(path.join(directory, `${id}.webp`), full);
    await fs.writeFile(path.join(directory, `${id}.thumb.webp`), thumb);

    images.push({
      src: mediaUrl(`${id}.webp`),
      thumb: mediaUrl(`${id}.thumb.webp`),
    });
  }

  return NextResponse.json({ images });
}
