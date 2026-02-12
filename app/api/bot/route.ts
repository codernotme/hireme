import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

import { env } from "@/config/env.server";
import { logBackend } from "@/lib/console-log";

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

  logBackend("info", `Bot run requested (mode=${mode || "unknown"}).`);

  if (!ALLOWED_MODES.has(mode)) {
    logBackend("warn", `Bot run rejected due to invalid mode: ${mode || "-"}.`);
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
    logBackend("error", `Python bot not found at ${scriptPath}.`);
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

  logBackend("info", `Spawning bot: ${env.botPython} ${args.join(" ")}`);

  return new Promise<Response>((resolve) => {
    const child = spawn(env.botPython, args, {
      cwd: workdir,
      env: process.env,
    });

    let stdoutRemainder = "";
    let stderrRemainder = "";

    const emitLines = (chunk: string, source: "stdout" | "stderr") => {
      const combined = source === "stdout" ? stdoutRemainder + chunk : stderrRemainder + chunk;
      const lines = combined.split(/\r?\n/);
      const remainder = lines.pop() ?? "";

      for (const line of lines) {
        if (line.trim()) {
          logBackend(
            source === "stdout" ? "info" : "error",
            `bot:${source} ${line}`,
          );
        }
      }

      if (source === "stdout") {
        stdoutRemainder = remainder;
      } else {
        stderrRemainder = remainder;
      }
    };

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      const chunk = data.toString();
      stdout += chunk;
      emitLines(chunk, "stdout");
    });

    child.stderr.on("data", (data) => {
      const chunk = data.toString();
      stderr += chunk;
      emitLines(chunk, "stderr");
    });

    child.on("close", (code) => {
      if (stdoutRemainder.trim()) {
        logBackend("info", `bot:stdout ${stdoutRemainder}`);
      }
      if (stderrRemainder.trim()) {
        logBackend("error", `bot:stderr ${stderrRemainder}`);
      }
      logBackend("info", `Bot process exited with code ${code ?? "unknown"}.`);
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
      logBackend("error", `Bot process failed to start: ${String(error)}`);
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
