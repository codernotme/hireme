"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

type HealthResponse = {
  ok: boolean;
  botWorkdirExists: boolean;
  configExists: boolean;
  ollamaBaseUrl: string;
};

type OllamaResponse = {
  ok: boolean;
  reachable: boolean;
  models: Array<{ name: string; fullName: string }>;
  defaultModel: string;
  baseUrl?: string;
  error?: string;
};

export const BotStatus = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ollama, setOllama] = useState<OllamaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [healthRes, ollamaRes] = await Promise.all([
          fetch("/api/health"),
          fetch("/api/ollama"),
        ]);
        const healthData = (await healthRes.json()) as HealthResponse;
        const ollamaData = (await ollamaRes.json()) as OllamaResponse;

        if (!cancelled) {
          setHealth(healthData);
          setOllama(ollamaData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
          err instanceof Error ? err.message : "Unable to load status",
        );
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const allGood = health?.ok && ollama?.reachable;

  return (
    <Card className="border border-default-200/60 bg-background/80">
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Local Status</h3>
          <Chip
            color={
            allGood
              ? "success"
              : ollama?.reachable === false
                ? "warning"
                : health?.ok
                  ? "success"
                  : "warning"
          }
            size="sm"
            variant="flat"
          >
            {allGood ? "Ready" : "Needs attention"}
          </Chip>
        </div>
        <p className="text-sm text-default-500">
          Bot, config, and Ollama (local AI) status.
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-3 text-sm text-default-600">
        {error ? <span className="text-danger">{error}</span> : null}
        <div className="flex items-center justify-between">
          <span>Bot directory</span>
          <span
            className={
              health?.botWorkdirExists ? "text-success" : "text-warning"
            }
          >
            {health?.botWorkdirExists ? "Found" : "Missing"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Config file</span>
          <span
            className={
              health?.configExists ? "text-success" : "text-warning"
            }
          >
            {health?.configExists ? "Found" : "Missing"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Ollama</span>
          <span className={ollama?.reachable ? "text-success" : "text-warning"}>
            {ollama?.reachable
              ? `Connected (${ollama.models?.length ?? 0} model${(ollama.models?.length ?? 0) === 1 ? "" : "s"})`
              : "Not reachable"}
          </span>
        </div>
        {ollama?.reachable && (ollama.models?.length ?? 0) > 0 ? (
          <div className="flex items-center justify-between">
            <span>Default model</span>
            <span className="text-default-500 font-mono text-xs">
            {ollama.defaultModel}
          </span>
          </div>
        ) : null}
        {health?.ollamaBaseUrl ? (
          <div className="flex items-center justify-between text-xs text-default-400">
            <span>Ollama URL</span>
            <span className="font-mono truncate max-w-[180px]">
            {health.ollamaBaseUrl}
          </span>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};
