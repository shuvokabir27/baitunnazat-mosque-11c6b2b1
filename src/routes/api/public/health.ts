import { createFileRoute } from "@tanstack/react-router";

// Lightweight keep-alive / health endpoint.
// Pinged on a schedule (pg_cron) so the worker stays warm and the site
// does not appear "down" after a period of inactivity. Returns fast with
// no database work to keep resource usage minimal.
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        }),
    },
  },
});
