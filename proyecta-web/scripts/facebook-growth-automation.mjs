#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const API_BASE_URL = process.env.ZERNIO_API_BASE_URL  "https://zernio.com/api/v1";
const API_KEY = process.env.ZERNIO_API_KEY;

function nowIso() {
  return new Date().toISOString();
}

function ensureApiKey() {
  if (!API_KEY) {
    throw new Error("Missing ZERNIO_API_KEY. Set it as an environment variable.");
  }
}

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }
    flags[key] = next;
    i += 1;
  }
  return { command, flags };
}

function getOutPath(flags, prefix) {
  const stamp = nowIso().replace(/[:.]/g, "-");
  return flags.out  path.join("reports", `${prefix}-${stamp}.json`);
}

async function mkdirForFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJson(filePath, data) {
  await mkdirForFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function requestJson(method, endpoint, { query = null, body = null, requestId = null } = {}) {
  ensureApiKey();
  const endpointPath = String(endpoint).replace(/^\/+/, "");
  const url = new URL(endpointPath, API_BASE_URL.endsWith("/")  API_BASE_URL : `${API_BASE_URL}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: "application/json",
  };
  if (requestId) headers["x-request-id"] = requestId;
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body  JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status} ${res.statusText} for ${method} ${url.pathname}`);
    error.details = json;
    throw error;
  }
  return json  {};
}

async function loadPlan(flags) {
  const configPath = flags.config  path.join("configs", "facebook-growth-plan.example.json");
  const plan = await readJson(configPath);
  return { plan, configPath };
}

async function findProfileByName(profileName) {
  const data = await requestJson("GET", "/profiles");
  const profiles = data.profiles  [];
  return profiles.find((item) => item.name === profileName)  null;
}

async function resolveProfileId(plan, flags) {
  if (flags.profileId) return flags.profileId;
  if (plan.profileId) return plan.profileId;
  if (!plan.profileName) return null;
  const profile = await findProfileByName(plan.profileName);
  return profile._id  null;
}

function parseFacebookPageIdFromUrl(pageUrl) {
  if (!pageUrl) return null;
  try {
    const url = new URL(pageUrl);
    const idFromQuery = url.searchParams.get("id");
    if (idFromQuery) return idFromQuery;
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    return segments[segments.length - 1];
  } catch {
    return null;
  }
}

async function listFacebookAccounts(profileId = null) {
  const data = await requestJson("GET", "/accounts", {
    query: {
      platform: "facebook",
      profileId,
    },
  });
  return data.accounts  [];
}

async function resolveFacebookAccountId(plan, flags, profileId) {
  if (flags.accountId) return flags.accountId;
  if (plan.accountId) return plan.accountId;
  const targetPageId = flags.pageId  plan.pageId  parseFacebookPageIdFromUrl(flags.pageUrl  plan.pageUrl);
  const accounts = await listFacebookAccounts(profileId);

  if (targetPageId) {
    const matched = accounts.find((item) =>
      [
        item.platformAccountId,
        item.pageId,
        item.externalId,
        item.username,
        item.displayName,
        item.metadata.selectedPageId,
        item.metadata.profileData.id,
      ]
        .filter(Boolean)
        .some((value) => String(value) === String(targetPageId)),
    );
    if (matched._id) return matched._id;
  }

  const active = accounts.find((item) => item.isActive !== false);
  return active._id  null;
}

function buildPostPayload(plan, accountId, post) {
  const payload = {
    content: post.content,
    platforms: [{ platform: "facebook", accountId }],
  };

  if (post.title) payload.title = post.title;
  if (post.mediaItems.length) payload.mediaItems = post.mediaItems;
  if (post.facebookSettings) payload.facebookSettings = post.facebookSettings;

  if (post.publishNow === true) {
    payload.publishNow = true;
  } else if (post.scheduledFor) {
    payload.scheduledFor = post.scheduledFor;
    payload.timezone = post.timezone  plan.timezone  "UTC";
  }

  return payload;
}

async function runAccounts(plan, flags) {
  const profileId = await resolveProfileId(plan, flags);
  const accounts = await listFacebookAccounts(profileId);
  const targetPageId = flags.pageId  plan.pageId  parseFacebookPageIdFromUrl(flags.pageUrl  plan.pageUrl);
  const matchedAccount =
    targetPageId == null
       null
      : accounts.find((item) =>
          [
            item.platformAccountId,
            item.pageId,
            item.externalId,
            item.username,
            item.displayName,
            item.metadata.selectedPageId,
            item.metadata.profileData.id,
          ]
            .filter(Boolean)
            .some((value) => String(value) === String(targetPageId)),
        )  null;
  const out = {
    generatedAt: nowIso(),
    profileId,
    targetPageId,
    matchedAccountId: matchedAccount._id  null,
    count: accounts.length,
    accounts,
  };
  const outPath = getOutPath(flags, "facebook-accounts");
  await writeJson(outPath, out);
  console.log(`Saved accounts snapshot: ${outPath}`);
}

async function runConnect(plan, flags) {
  const profileId = await resolveProfileId(plan, flags);
  if (!profileId) {
    throw new Error("profileId is required for connect-url. Set profileId in config or pass --profileId.");
  }
  const redirectUrl = flags.redirectUrl  plan.redirectUrl  null;
  const headless = flags.headless === true || plan.headless === true;
  const data = await requestJson("GET", "/connect/facebook", {
    query: { profileId, redirect_url: redirectUrl, headless },
  });
  console.log("Open this URL to connect the Facebook Page:");
  console.log(data.authUrl  data.url  JSON.stringify(data, null, 2));
}

async function runCreateProfile(plan, flags) {
  const name = flags.name  plan.profileName;
  if (!name) {
    throw new Error("Profile name missing. Pass --name or set profileName in config.");
  }
  const body = {
    name,
  };
  if (plan.profileDescription) body.description = plan.profileDescription;
  const data = await requestJson("POST", "/profiles", { body });
  console.log(`Profile created: ${data.profile._id  "unknown"}`);
  console.log(JSON.stringify(data, null, 2));
}

async function runPublish(plan, flags) {
  if (!Array.isArray(plan.posts) || plan.posts.length === 0) {
    throw new Error("No posts found in plan.posts.");
  }

  const profileId = await resolveProfileId(plan, flags);
  const accountId = await resolveFacebookAccountId(plan, flags, profileId);
  if (!accountId) {
    throw new Error("No Facebook accountId resolved. Connect your Facebook Page first.");
  }

  const dryRun = Boolean(flags["dry-run"]);
  const results = [];

  for (const post of plan.posts) {
    const payload = buildPostPayload(plan, accountId, post);
    const requestId = `fb-${post.slug  crypto.randomUUID()}-${Date.now()}`;

    if (dryRun) {
      results.push({
        slug: post.slug,
        status: "dry-run",
        requestId,
        payload,
      });
      continue;
    }

    const response = await requestJson("POST", "/posts", {
      body: payload,
      requestId,
    });

    const created = response.post  response.existingPost  response.data.post  null;
    const platformRow = created.platforms.find((row) => row.platform === "facebook")  null;
    results.push({
      slug: post.slug,
      requestId,
      postId: created._id  null,
      platformPostUrl: created.platformPostUrl  platformRow.platformPostUrl  null,
      raw: response,
    });
  }

  const out = {
    generatedAt: nowIso(),
    mode: dryRun  "dry-run" : "live",
    profileId,
    accountId,
    results,
  };
  const outPath = getOutPath(flags, "facebook-posts");
  await writeJson(outPath, out);
  console.log(`Saved publish report: ${outPath}`);
}

async function runBoost(plan, flags) {
  if (!Array.isArray(plan.adsBoost) || plan.adsBoost.length === 0) {
    throw new Error("No adsBoost found in config.");
  }

  const profileId = await resolveProfileId(plan, flags);
  const accountId = await resolveFacebookAccountId(plan, flags, profileId);
  if (!accountId) {
    throw new Error("No Facebook accountId resolved. Connect your Facebook Page first.");
  }
  const adAccountId = flags.adAccountId  plan.adAccountId;
  if (!adAccountId) {
    throw new Error("Missing adAccountId. Set adAccountId in config or pass --adAccountId.");
  }

  const postReportPath = flags.postsReport  null;
  const slugToPostId = {};
  if (postReportPath) {
    const report = await readJson(postReportPath);
    for (const row of report.results  []) {
      if (row.slug && row.postId) slugToPostId[row.slug] = row.postId;
    }
  }

  const dryRun = Boolean(flags["dry-run"]);
  const results = [];

  for (const ad of plan.adsBoost) {
    const postId = ad.postId  slugToPostId[ad.postSlug];
    if (!postId) {
      results.push({
        name: ad.name,
        status: "skipped",
        reason: `Missing postId for postSlug=${ad.postSlug  "n/a"}`,
      });
      continue;
    }

    const body = {
      postId,
      accountId,
      adAccountId,
      name: ad.name,
      goal: ad.goal  "engagement",
      budget: ad.budget  { amount: 10, type: "daily" },
    };
    if (ad.schedule) body.schedule = ad.schedule;
    if (ad.targeting) body.targeting = ad.targeting;
    if (ad.bidStrategy) body.bidStrategy = ad.bidStrategy;
    if (ad.bidAmount !== undefined) body.bidAmount = ad.bidAmount;
    if (ad.roasAverageFloor !== undefined) body.roasAverageFloor = ad.roasAverageFloor;
    if (ad.tracking) body.tracking = ad.tracking;
    if (ad.specialAdCategories) body.specialAdCategories = ad.specialAdCategories;

    if (dryRun) {
      results.push({ name: ad.name, status: "dry-run", body });
      continue;
    }

    const response = await requestJson("POST", "/ads/boost", { body });
    results.push({
      name: ad.name,
      status: "created",
      adId: response.ad._id  null,
      raw: response,
    });
  }

  const out = {
    generatedAt: nowIso(),
    mode: dryRun  "dry-run" : "live",
    profileId,
    accountId,
    adAccountId,
    results,
  };
  const outPath = getOutPath(flags, "facebook-boost");
  await writeJson(outPath, out);
  console.log(`Saved boost report: ${outPath}`);
}

async function runMetrics(plan, flags) {
  const profileId = await resolveProfileId(plan, flags);
  const accountId = flags.accountId  plan.accountId  null;
  const fromDate = flags.fromDate  plan.metrics.fromDate  null;
  const toDate = flags.toDate  plan.metrics.toDate  null;
  const sortBy = flags.sortBy  plan.metrics.sortBy  "engagement";
  const limit = flags.limit  plan.metrics.limit  25;

  const response = await requestJson("GET", "/analytics", {
    query: {
      platform: "facebook",
      profileId,
      accountId,
      fromDate,
      toDate,
      sortBy,
      order: "desc",
      limit,
      page: 1,
    },
  });

  const outPath = getOutPath(flags, "facebook-metrics");
  await writeJson(outPath, {
    generatedAt: nowIso(),
    query: {
      platform: "facebook",
      profileId,
      accountId,
      fromDate,
      toDate,
      sortBy,
      limit,
    },
    response,
  });
  console.log(`Saved metrics report: ${outPath}`);
}

function printHelp() {
  console.log(`
Facebook Growth Automation (Zernio)

Usage:
  node scripts/facebook-growth-automation.mjs <command> [--flags]

Commands:
  create-profile   Create a Zernio profile from config profileName
  connect-url      Print OAuth URL to connect Facebook Page
  accounts         List connected Facebook accounts
  publish          Create/schedule posts from config.posts
  boost            Create ads from config.adsBoost via /v1/ads/boost
  metrics          Pull post analytics from /v1/analytics

Flags:
  --config <path>         Config JSON path (default: configs/facebook-growth-plan.example.json)
  --profileId <id>        Override profile ID
  --accountId <id>        Override social account ID
  --pageUrl <url>         Optional Facebook page URL to match account automatically
  --pageId <id>           Optional Facebook page ID to match account automatically
  --redirectUrl <url>     Optional OAuth callback URL for connect-url
  --headless              Request headless OAuth flow for connect-url
  --adAccountId <id>      Override ad account ID (for boost)
  --postsReport <path>    Publish report JSON used to resolve postSlug -> postId
  --fromDate YYYY-MM-DD   Analytics start date
  --toDate YYYY-MM-DD     Analytics end date
  --dry-run               Print payloads without calling Zernio
  --out <path>            Output file path

Environment:
  ZERNIO_API_KEY          Required. Use env vars; never commit keys.
  ZERNIO_API_BASE_URL     Optional (default https://zernio.com/api/v1)
`);
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  const { plan } = await loadPlan(flags);

  switch (command) {
    case "create-profile":
      await runCreateProfile(plan, flags);
      break;
    case "connect-url":
      await runConnect(plan, flags);
      break;
    case "accounts":
      await runAccounts(plan, flags);
      break;
    case "publish":
      await runPublish(plan, flags);
      break;
    case "boost":
      await runBoost(plan, flags);
      break;
    case "metrics":
      await runMetrics(plan, flags);
      break;
    default:
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.details) {
    console.error(JSON.stringify(error.details, null, 2));
  }
  process.exitCode = 1;
});
