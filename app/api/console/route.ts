import { getBackendLogBuffer, subscribeBackendLog } from "@/lib/console-log";

export const runtime = "nodejs";

const formatEvent = (value: unknown) => `data: ${JSON.stringify(value)}\n\n`;

export async function GET() {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let keepAlive: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (entry: unknown) => {
        controller.enqueue(encoder.encode(formatEvent(entry)));
      };

      for (const entry of getBackendLogBuffer()) {
        send(entry);
      }

      unsubscribe = subscribeBackendLog(send);
      keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":keep-alive\n\n"));
      }, 15000);
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (keepAlive) {
        clearInterval(keepAlive);
        keepAlive = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
