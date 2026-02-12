import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { logBackend } from "@/lib/console-log";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

const sanitizeName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);

export async function POST(request: Request) {
  logBackend("info", "File upload requested.");
  const formData = await request.formData();
  const kind = String(formData.get("kind") || "uploads").toLowerCase();
  const files = formData.getAll("files");
  const singleFile = formData.get("file");
  const allFiles = [...files, ...(singleFile ? [singleFile] : [])].filter(
    (file): file is File => file instanceof File,
  );

  if (!allFiles.length) {
    logBackend("warn", "Upload aborted: no files provided.");
    return NextResponse.json(
      { ok: false, error: "No files uploaded" },
      { status: 400 },
    );
  }

  logBackend(
    "info",
    `Upload received (${allFiles.length} file(s), kind=${kind}).`,
  );

  const baseDir = path.resolve(process.cwd(), "bot", "uploads", kind);
  await fs.mkdir(baseDir, { recursive: true });

  const savedPaths: string[] = [];

  for (const file of allFiles) {
    if (file.size > MAX_BYTES) {
      logBackend(
        "warn",
        `Upload aborted: ${file.name || "(unnamed)"} too large (${file.size}).`,
      );
      return NextResponse.json(
        { ok: false, error: "File too large (max 10MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeName(file.name || "upload");
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const targetPath = path.join(baseDir, uniqueName);

    await fs.writeFile(targetPath, new Uint8Array(buffer));
    savedPaths.push(targetPath);
    logBackend("info", `Upload saved: ${targetPath}.`);
  }

  logBackend("info", `Upload completed (${savedPaths.length} file(s)).`);
  return NextResponse.json({ ok: true, paths: savedPaths });
}
