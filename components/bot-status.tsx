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

export const BotStatus = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/health");
        const data = (await response.json()) as HealthResponse;

        if (!cancelled) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load status");
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="border border-default-200/60 bg-background/80">
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Local Status</h3>
          <Chip
            color={health?.ok ? "success" : "warning"}
            size="sm"
            variant="flat"
          >
            {health?.ok ? "Ready" : "Needs attention"}
          </Chip>
        </div>
        <p className="text-sm text-default-500">
          Checks that your local bot and config paths are discoverable.
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-3 text-sm text-default-600">
        {error ? <span className="text-danger">{error}</span> : null}
        <div className="flex items-center justify-between">
          <span>Bot directory</span>
          <span className={health?.botWorkdirExists ? "text-success" : "text-warning"}>
            {health?.botWorkdirExists ? "Found" : "Missing"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Config file</span>
          <span className={health?.configExists ? "text-success" : "text-warning"}>
            {health?.configExists ? "Found" : "Missing"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Ollama</span>
          <span className="text-default-500">{health?.ollamaBaseUrl ?? "-"}</span>
        </div>
      </CardBody>
    </Card>
  );
};
