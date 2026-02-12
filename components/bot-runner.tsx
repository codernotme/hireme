"use client";

import { useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Snippet } from "@heroui/snippet";

const MODES = [
  {
    id: "full",
    label: "Full Campaign",
    description: "LinkedIn, Gmail, X, and job boards",
  },
  {
    id: "linkedin",
    label: "LinkedIn Outreach",
    description: "Connections, DMs, follow-ups",
  },
  {
    id: "gmail",
    label: "Gmail Cold Email",
    description: "Personalized campaigns",
  },
  {
    id: "x",
    label: "X Engagement",
    description: "Posts and recruiter engagement",
  },
  {
    id: "jobs",
    label: "Job Platforms",
    description: "Unstop, Naukri, Internshala",
  },
  {
    id: "report",
    label: "Daily Report",
    description: "Generate summary report",
  },
] as const;

type RunResult = {
  ok: boolean;
  code: number | null;
  output: string;
  errorOutput: string;
};

export const BotRunner = () => {
  const [activeMode, setActiveMode] = useState<(typeof MODES)[number]["id"]>(
    "full",
  );
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "error">(
    "idle",
  );
  const [result, setResult] = useState<RunResult | null>(null);

  const activeConfig = useMemo(
    () => MODES.find((mode) => mode.id === activeMode),
    [activeMode],
  );

  const handleRun = async () => {
    setStatus("running");
    setResult(null);

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: activeMode }),
      });

      const data = (await response.json()) as RunResult & { ok?: boolean };
      const ok = response.ok && data.ok;

      setResult({
        ok: Boolean(ok),
        code: data.code ?? null,
        output: data.output ?? "",
        errorOutput: data.errorOutput ?? "",
      });
      setStatus(ok ? "ok" : "error");
    } catch (error) {
      setResult({
        ok: false,
        code: null,
        output: "",
        errorOutput:
          error instanceof Error ? error.message : "Unexpected error",
      });
      setStatus("error");
    }
  };

  const statusLabel =
    status === "running"
      ? "Running"
      : status === "ok"
        ? "Completed"
        : status === "error"
          ? "Failed"
          : "Idle";

  const runHint = (() => {
    if (!result || result.ok) {
      return null;
    }

    const combined = `${result.output}\n${result.errorOutput}`;

    if (combined.includes("LinkedIn verification required")) {
      return {
        title: "LinkedIn needs manual verification",
        body: "Open onboarding, disable headless mode, and enable manual verification to complete 2FA in the browser window.",
      };
    }

    if (
      combined.includes("Ollama generation failed") ||
      combined.includes("/api/generate")
    ) {
      return {
        title: "Ollama is not reachable",
        body: "Start the Ollama server and confirm the base URL in onboarding. The default is http://localhost:11434.",
      };
    }

    return null;
  })();

  return (
    <Card className="border border-default-200/60 bg-background/80">
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Run the Automation Bot</h3>
          <Chip
            color={
              status === "error" ? "danger" : status === "ok" ? "success" : "default"
            }
            size="sm"
            variant="flat"
          >
            {statusLabel}
          </Chip>
        </div>
        <p className="text-sm text-default-500">
          Choose a mode and run the local Python bot from this UI.
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              className={`rounded-xl border px-4 py-3 text-left transition ${
                activeMode === mode.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-default-200/70 bg-default-50"
              }`}
              onClick={() => setActiveMode(mode.id)}
              type="button"
            >
              <p className="font-medium text-default-900">{mode.label}</p>
              <p className="text-xs text-default-500">{mode.description}</p>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            color="primary"
            isLoading={status === "running"}
            onPress={handleRun}
            radius="full"
            variant="shadow"
          >
            {status === "running" ? "Running..." : "Run Bot"}
          </Button>
          {activeConfig ? (
            <span className="text-sm text-default-500">
              Selected: <span className="font-semibold">{activeConfig.label}</span>
            </span>
          ) : null}
        </div>
        {result ? (
          <Snippet
            className="max-w-full"
            color={result.ok ? "success" : "danger"}
            variant="bordered"
          >
            {(result.output || result.errorOutput || "No output").slice(0, 1800)}
          </Snippet>
        ) : (
          <Snippet className="max-w-full" color="default" variant="bordered">
            Ready to run. Output will appear here.
          </Snippet>
        )}
        {runHint ? (
          <div className="rounded-xl border border-warning-200/60 bg-warning-50 px-4 py-3 text-sm text-warning-700">
            <p className="font-semibold">{runHint.title}</p>
            <p>{runHint.body}</p>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};
