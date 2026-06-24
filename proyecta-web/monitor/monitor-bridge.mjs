import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const monitorDir = path.dirname(__filename);
const projectRoot = path.resolve(monitorDir, "..");
const scriptsDir = path.join(projectRoot, "scripts");
const runtimeDir = path.join(projectRoot, ".cloudflare-runtime");
const watchScriptPath = path.join(scriptsDir, "watch-cloudflare-backend.ps1");
const checkScriptPath = path.join(scriptsDir, "check-cloudflare-backend.ps1");
const watchLogPath = path.join(runtimeDir, "backend-watch.log");
const stableApiBase = "https://nova-scientia-api.unhumanx.workers.dev";
const port = 8099;

function withCors(headers = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...headers,
  };
}

function writeJson(res, payload, statusCode = 200) {
  res.writeHead(statusCode, withCors({ "Content-Type": "application/json; charset=utf-8" }));
  res.end(JSON.stringify(payload));
}

function writeText(res, payload, statusCode = 200, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, withCors({ "Content-Type": contentType }));
  res.end(payload);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

function safeParseJson(value) {
  if (!value || !String(value).trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getWatcherProcessInfo() {
  const command = [
    "$proc = Get-CimInstance Win32_Process -Filter \"Name = 'powershell.exe'\" |",
    "Where-Object { $_.CommandLine -match 'watch-cloudflare-backend\\.ps1' } |",
    "Select-Object -First 1 ProcessId,CommandLine,CreationDate;",
    "if ($proc) { $proc | ConvertTo-Json -Compress }",
  ].join(" ");

  const result = spawnSync("powershell.exe", ["-NoProfile", "-Command", command], {
    encoding: "utf8",
  });

  if (result.error) return null;
  return safeParseJson(result.stdout);
}

function startDetachedPowerShell(scriptPath, extraArgs = []) {
  const args = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...extraArgs];
  const child = spawn("powershell.exe", args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
  return child.pid;
}

async function tailFileLines(filePath, maxLines = 10) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    const lines = raw.split(/\r\n/).filter(Boolean);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

async function checkStableHealth() {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${stableApiBase}/api/health`, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - started;
    if (!response.ok) {
      return { ok: false, latencyMs, detail: `HTTP ${response.status}` };
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("application/json")) {
      return { ok: false, latencyMs, detail: "Respuesta no JSON" };
    }

    const data = await response.json();
    return { ok: Boolean(data.ok), latencyMs, detail: data.ok  "ok=true" : "ok=false" };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: error instanceof Error  error.message : String(error),
    };
  }
}

async function buildBridgeStatus() {
  const watcher = getWatcherProcessInfo();
  const logTail = await tailFileLines(watchLogPath, 12);
  const stableHealth = await checkStableHealth();

  return {
    ok: true,
    timestamp: new Date().toISOString(),
    watcher: {
      running: Boolean(watcher),
      processId: watcher.ProcessId  null,
      startedAt: watcher.CreationDate  null,
    },
    stableHealth,
    logTail,
    paths: {
      watchScriptPath,
      checkScriptPath,
      watchLogPath,
    },
  };
}

async function runHealthCheckScript() {
  return new Promise((resolve) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", checkScriptPath],
      { windowsHide: true },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function handleBridgeApi(req, res, pathname) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, withCors());
    res.end();
    return;
  }

  if (pathname === "/api/bridge/ping" && req.method === "GET") {
    writeJson(res, { ok: true, bridge: "online", port });
    return;
  }

  if (pathname === "/api/bridge/status" && req.method === "GET") {
    const status = await buildBridgeStatus();
    writeJson(res, status);
    return;
  }

  if (pathname === "/api/bridge/start-watch" && req.method === "POST") {
    const watcher = getWatcherProcessInfo();
    if (watcher) {
      writeJson(res, {
        ok: true,
        started: false,
        message: "La vigilancia ya estaba activa.",
        processId: watcher.ProcessId,
      });
      return;
    }

    const pid = startDetachedPowerShell(watchScriptPath, ["-CheckEverySeconds", "90"]);
    writeJson(res, {
      ok: true,
      started: true,
      message: "Vigilancia automatica iniciada.",
      processId: pid,
    });
    return;
  }

  if (pathname === "/api/bridge/reactivate-now" && req.method === "POST") {
    const pid = startDetachedPowerShell(watchScriptPath, ["-RunOnce"]);
    writeJson(res, {
      ok: true,
      started: true,
      message: "Reactivacion puntual lanzada.",
      processId: pid,
    });
    return;
  }

  if (pathname === "/api/bridge/check-now" && req.method === "POST") {
    const result = await runHealthCheckScript();
    writeJson(res, {
      ok: result.code === 0,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    });
    return;
  }

  writeJson(res, { ok: false, error: "Endpoint no encontrado." }, 404);
}

async function handleStatic(req, res, pathname) {
  let localPath = pathname === "/"  "/nova-monitor-local.html" : pathname;
  localPath = decodeURIComponent(localPath);
  const candidate = path.normalize(path.join(monitorDir, localPath.replace(/^\/+/, "")));

  if (!candidate.startsWith(monitorDir)) {
    writeText(res, "Ruta invalida.", 403);
    return;
  }

  if (!fs.existsSync(candidate)) {
    writeText(res, "No encontrado.", 404);
    return;
  }

  const stat = await fsp.stat(candidate);
  if (stat.isDirectory()) {
    writeText(res, "Directorio no permitido.", 403);
    return;
  }

  const content = await fsp.readFile(candidate);
  writeText(res, content, 200, getMimeType(candidate));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    if (url.pathname.startsWith("/api/bridge/")) {
      await handleBridgeApi(req, res, url.pathname);
      return;
    }
    await handleStatic(req, res, url.pathname);
  } catch (error) {
    writeJson(
      res,
      { ok: false, error: error instanceof Error  error.message : String(error) },
      500,
    );
  }
});

server.listen(port, () => {
  console.log(`[monitor-bridge] listo en http://127.0.0.1:${port}`);
});
