import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

import { env } from "@/config/env.server";

export const runtime = "nodejs";

export async function GET() {
  const workdir = path.resolve(process.cwd(), env.botWorkdir);
  const configPath = path.isAbsolute(env.botConfigPath)
    ? env.botConfigPath
    : path.join(workdir, env.botConfigPath);

  const [botWorkdirExists, configExists] = await Promise.all([
    fs
      .access(workdir)
      .then(() => true)
      .catch(() => false),
    fs
      .access(configPath)
      .then(() => true)
      .catch(() => false),
  ]);

  return NextResponse.json({
    ok: botWorkdirExists && configExists,
    botWorkdirExists,
    configExists,
    ollamaBaseUrl: env.ollamaBaseUrl,
  });
}
