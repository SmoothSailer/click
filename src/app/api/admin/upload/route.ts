import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse, type NextRequest } from "next/server";

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

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return error("Unauthorized", 401);
  }

  try {
    return await handleUpload(request);
  } catch (uploadError) {
    // Always answer with JSON: an empty 500 body makes the browser report
    // "Unexpected end of JSON input" instead of the real problem.
    console.error("Photo upload failed:", uploadError);
    return error(
      "The photos could not be uploaded. Please try again.",
      500,
    );
  }
}

async function handleUpload(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return error("Could not read the upload. Please try again.", 400);
  }

  const files = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return error("No photos were received.", 400);
  }

  if (files.length > MAX_FILES) {
    return error(`Upload at most ${MAX_FILES} photos at a time.`, 400);
  }

  // Validate everything before writing anything, so a bad file does not
  // leave half an upload on disk.
  for (const file of files) {
    // Some mobile browsers leave the type empty; sharp validates those.
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return error(`"${file.name}" is not a supported image format.`, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return error(`"${file.name}" is larger than 10 MB.`, 400);
    }
  }

  const directory = await ensureUploadDir();

  let sharp: (typeof import("sharp"))["default"];
  try {
    // Loaded lazily so a missing native binary becomes a JSON error rather
    // than a module-load crash with an empty response body.
    sharp = (await import("sharp")).default;
  } catch (loadError) {
    console.error("Could not load sharp:", loadError);
    return error(
      "Image processing is not available on the server. Restart the app and try again.",
      500,
    );
  }

  const images: { src: string; thumb: string }[] = [];
  const written: string[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // sharp throws on anything it cannot decode, which keeps non-image
      // files (renamed by mistake) out of the upload folder.
      await sharp(buffer).metadata();

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

      const fullName = `${id}.webp`;
      const thumbName = `${id}.thumb.webp`;

      written.push(fullName, thumbName);
      await fs.writeFile(path.join(directory, fullName), full);
      await fs.writeFile(path.join(directory, thumbName), thumb);

      images.push({
        src: mediaUrl(fullName),
        thumb: mediaUrl(thumbName),
      });
    } catch (processError) {
      console.error(`Could not process "${file.name}":`, processError);
      await removeFiles(directory, written);
      return error(
        `"${file.name}" could not be read as an image. Try a JPG, PNG or WEBP photo.`,
        400,
      );
    }
  }

  return NextResponse.json({ images });
}

async function removeFiles(directory: string, filenames: string[]) {
  await Promise.all(
    filenames.map(async (filename) => {
      try {
        await fs.unlink(path.join(directory, filename));
      } catch {
        // The file may not have been written yet; nothing to clean up.
      }
    }),
  );
}
