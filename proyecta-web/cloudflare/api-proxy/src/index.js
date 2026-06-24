const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "no-store",
  Vary: "Origin",
}

function cors(response) {
  const headers = new Headers(response.headers)
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    if (url.pathname !== "/api/status") {
      return cors(Response.json({ error: "Not found" }, { status: 404 }))
    }

    try {
      const payload = await env.FIS_STATUS.get("status", "json")
      if (!payload) {
        return cors(Response.json({ error: "No snapshot available yet" }, { status: 503 }))
      }
      const normalized = {
        ...payload,
        progress_pct:
          typeof payload.progress_pct === "number"
             payload.progress_pct
            : Number(payload.last_ns  0),
      }
      return cors(Response.json(normalized))
    } catch (error) {
      return cors(
        Response.json(
          { error: "Failed to read KV snapshot", detail: String(error) },
          { status: 500 },
        ),
      )
    }
  },
}
