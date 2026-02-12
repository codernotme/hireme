import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

import { env } from "@/config/env.server";

export const runtime = "nodejs";

const MAX_OUTPUT = 20000;
const ALLOWED_MODES = new Set([
  "full",
  "linkedin",
  "gmail",
  "x",
  "jobs",
  "report",
]);

const clampOutput = (value: string) =>
  value.length > MAX_OUTPUT ? `${value.slice(0, MAX_OUTPUT)}\n...truncated` : value;

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const mode = typeof payload?.mode === "string" ? payload.mode : "";

  if (!ALLOWED_MODES.has(mode)) {
    return NextResponse.json(
      { ok: false, error: "Invalid mode" },
      { status: 400 },
    );
  }

  const workdir = path.resolve(process.cwd(), env.botWorkdir);
  const scriptPath = path.join(workdir, "main.py");
  const configPath = path.isAbsolute(env.botConfigPath)
    ? env.botConfigPath
    : path.join(workdir, env.botConfigPath);

  try {
    await fs.access(scriptPath);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Python bot not found", details: String(error) },
      { status: 500 },
    );
  }

  const args = [scriptPath];

  if (mode === "report") {
    args.push("--report");
  } else {
    args.push("--mode", mode);
  }

  if (env.botConfigPath) {
    args.push("--config", configPath);
  }

  return new Promise((resolve) => {
    const child = spawn(env.botPython, args, {
      cwd: workdir,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve(
        NextResponse.json({
          ok: code === 0,
          code,
          output: clampOutput(stdout.trim()),
          errorOutput: clampOutput(stderr.trim()),
        }),
      );
    });

    child.on("error", (error) => {
      resolve(
        NextResponse.json(
          {
            ok: false,
            code: null,
            output: "",
            errorOutput: String(error),
          },
          { status: 500 },
        ),
      );
    });
  });
}
