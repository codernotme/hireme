import { NextResponse } from "next/server";

import { env } from "@/config/env.server";
import { logBackend } from "@/lib/console-log";

export const runtime = "nodejs";

/** Preferred default model names in order (first available is used). */
const PREFERRED_DEFAULT_MODELS = [
  "llama3.2",
  "llama3.1",
  "llama3",
  "llama2",
  "mistral",
  "codellama",
];

type OllamaModel = { name: string; digest?: string; size?: number };

function getModelDisplayName(raw: string): string {
  const name = raw.split(":")[0] ?? raw;
  return name.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = searchParams.get("baseUrl") ?? env.ollamaBaseUrl;
  const url = `${baseUrl.replace(/\/$/, "")}/api/tags`;

  logBackend("info", `Ollama tags requested (baseUrl=${baseUrl}).`);

  try {
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(8000) });

    if (!res.ok) {
      logBackend("warn", `Ollama tags failed (${res.status}) ${baseUrl}`);
      return NextResponse.json({
        ok: false,
        reachable: true,
        error: `Ollama returned ${res.status}`,
        models: [],
        defaultModel: "llama3.2",
      });
    }

    const data = (await res.json()) as { models?: OllamaModel[] };
    const rawModels = Array.isArray(data.models) ? data.models : [];
    const models = rawModels.map((m) => ({
      name: getModelDisplayName(m.name ?? ""),
      fullName: m.name ?? "",
    }));

    const names = Array.from(new Set(models.map((m) => m.name)));
    let defaultModel = PREFERRED_DEFAULT_MODELS.find((p) =>
      names.some((n) => n === p || n.startsWith(`${p}:`)),
    );
    if (!defaultModel && names.length > 0) {
      defaultModel = names[0];
    }
    if (!defaultModel) {
      defaultModel = "llama3.2";
    }

    logBackend("info", `Ollama tags ok (${models.length} models, default=${defaultModel}).`);
    return NextResponse.json({
      ok: true,
      reachable: true,
      models,
      defaultModel,
      baseUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logBackend("error", `Ollama tags error: ${message}`);
    return NextResponse.json(
      {
        ok: false,
        reachable: false,
        error: message,
        models: [],
        defaultModel: "llama3.2",
        baseUrl,
      },
      { status: 200 },
    );
  }
}
