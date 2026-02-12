import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

const sanitizeName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);

export async function POST(request: Request) {
  const formData = await request.formData();
  const kind = String(formData.get("kind") || "uploads").toLowerCase();
  const files = formData.getAll("files");
  const singleFile = formData.get("file");
  const allFiles = [...files, ...(singleFile ? [singleFile] : [])].filter(
    (file): file is File => file instanceof File,
  );

  if (!allFiles.length) {
    return NextResponse.json(
      { ok: false, error: "No files uploaded" },
      { status: 400 },
    );
  }

  const baseDir = path.resolve(process.cwd(), "bot", "uploads", kind);
  await fs.mkdir(baseDir, { recursive: true });

  const savedPaths: string[] = [];

  for (const file of allFiles) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: "File too large (max 10MB)." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeName(file.name || "upload");
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const targetPath = path.join(baseDir, uniqueName);

    await fs.writeFile(targetPath, buffer);
    savedPaths.push(targetPath);
  }

  return NextResponse.json({ ok: true, paths: savedPaths });
}
