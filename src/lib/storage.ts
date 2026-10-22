import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

/** Absolute path of the folder that holds uploaded truck photos. */
export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR;
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "storage", "uploads");
}

export async function ensureUploadDir(): Promise<string> {
  const dir = getUploadDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Resolves a requested media path inside the upload directory.
 * Returns null when the path would escape the directory.
 */
export function resolveMediaPath(segments: string[]): string | null {
  if (segments.length === 0) return null;

  const root = getUploadDir();
  const target = path.resolve(root, ...segments);

  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

export function mediaUrl(filename: string): string {
  return `/api/media/${filename}`;
}

/** Removes uploaded files that are no longer referenced by any truck. */
export async function deleteMediaFiles(paths: string[]): Promise<void> {
  const dir = getUploadDir();

  for (const mediaPath of paths) {
    const filename = mediaPath.replace(/^\/api\/media\//, "");
    if (!filename || filename.includes("/") || filename.includes("..")) continue;

    try {
      await fs.unlink(
        path.join(/* turbopackIgnore: true */ dir, filename),
      );
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "ENOENT") {
        console.error(`Failed to delete media file ${filename}:`, error);
      }
    }
  }
}
