"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

type LogEntry = {
  ts: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
};

const MAX_ENTRIES = 300;

export const BackendConsole = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "error">(
    "connecting",
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const source = new EventSource("/api/console");

    const handleOpen = () => {
      setStatus("open");
    };

    const handleError = () => {
      setStatus("error");
    };

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const entry = JSON.parse(event.data) as LogEntry;

        setEntries((prev) => {
          const next = [...prev, entry];
          return next.length > MAX_ENTRIES
            ? next.slice(next.length - MAX_ENTRIES)
            : next;
        });
      } catch {
        setEntries((prev) => {
          const next = [
            ...prev,
            {
              ts: new Date().toISOString(),
              level: "warn" as const,
              message: "Unable to parse console message.",
            },
          ];
          return next.length > MAX_ENTRIES
            ? next.slice(next.length - MAX_ENTRIES)
            : next;
        });
      }
    };

    source.addEventListener("open", handleOpen);
    source.addEventListener("error", handleError);
    source.addEventListener("message", handleMessage);

    return () => {
      source.removeEventListener("open", handleOpen);
      source.removeEventListener("error", handleError);
      source.removeEventListener("message", handleMessage);
      source.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const statusLabel = useMemo(() => {
    if (status === "open") {
      return "Live";
    }

    if (status === "error") {
      return "Disconnected";
    }

    return "Connecting";
  }, [status]);

  const statusColor = status === "open" ? "success" : status === "error"
    ? "danger"
    : "warning";

  return (
    <Card className="border border-default-200/60 bg-background/80">
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Backend Console</h3>
          <Chip color={statusColor} size="sm" variant="flat">
            {statusLabel}
          </Chip>
        </div>
        <p className="text-sm text-default-500">
          Live stream of backend activity from API routes and bot runs.
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-default-500">
            Last {Math.min(entries.length, MAX_ENTRIES)} entries
          </span>
          <Button
            size="sm"
            variant="flat"
            onPress={() => setEntries([])}
          >
            Clear
          </Button>
        </div>
        <div className="max-h-72 overflow-auto rounded-xl border border-default-200/70 bg-default-50 p-3 text-xs text-default-700">
          {entries.length ? (
            entries.map((entry, index) => (
              <div key={`${entry.ts}-${index}`} className="font-mono">
                [{entry.ts}] [{entry.level.toUpperCase()}] {entry.message}
              </div>
            ))
          ) : (
            <div className="font-mono text-default-500">
              Waiting for backend activity...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </CardBody>
    </Card>
  );
};
