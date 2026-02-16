/**
 * api-component1.2.js
 * Stateless API helper module (NO DOM, NO window/document, NO onload/listeners).
 *
 * Design goals:
 * - Works in browser apps (app1.2) and in MCP/server contexts (apiserver1.2).
 * - All state is passed in explicitly (token, ids, baseUrl).
 * - Returns structured data; never returns HTML.
 *
 * Usage (browser):
 *   import API from "./api-component1.2.js";
 *   const api = API.create({ baseUrl: "http://localhost:3000" });
 *   const { token } = await api.getToken({ username, password });
 *   const ranches = await api.getRanches({ token });
 *
 * Usage (Node/MCP):
 *   import API from "./api-component1.2.js";
 *   const api = API.create({ baseUrl: process.env.API_BASE_URL });
 *   const ranches = await api.getRanches({ token });
 */

const DEFAULT_TIMEOUT_MS = 30000;

// ---- internal helpers (no side effects) ----

function withTimeout(fetchFn, ms = DEFAULT_TIMEOUT_MS) {
  if (!ms || ms <= 0) return fetchFn(null);

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeout = setTimeout(() => {
    if (controller) controller.abort();
  }, ms);

  const p = fetchFn(controller ? controller.signal : null);

  return p.finally(() => clearTimeout(timeout));
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return "";
  return String(baseUrl).replace(/\/+$/, "");
}

function buildUrl(baseUrl, path) {
  const b = normalizeBaseUrl(baseUrl);
  const p = String(path || "").replace(/^\/+/, "");
  return b ? `${b}/${p}` : `/${p}`;
}

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function makeError({ code, message, status, details }) {
  const err = new Error(message || "API Error");
  if (code) err.code = code;
  if (status != null) err.status = status;
  if (details != null) err.details = details;
  return err;
}

function requireToken(token) {
  if (!token || typeof token !== "string") {
    throw makeError({ code: "NO_TOKEN", message: "Missing token (expected string 'token' argument)." });
  }
}

// Generic request helper
async function requestJson({ baseUrl, path, method = "GET", token, body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const url = buildUrl(baseUrl, path);

  const mergedHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) mergedHeaders.Authorization = `Bearer ${token}`;

  return withTimeout(async (signal) => {
    const res = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: body == null ? undefined : JSON.stringify(body),
      signal: signal || undefined,
    });

    const payload = await parseJsonSafe(res);

    if (!res.ok) {
      throw makeError({
        code: (payload && (payload.errorCode || payload.code)) || "HTTP_ERROR",
        message: (payload && payload.message) || `HTTP ${res.status} ${res.statusText}`,
        status: res.status,
        details: payload,
      });
    }

    return payload;
  }, timeoutMs);
}

// ---- public API ----

function create({ baseUrl = "", timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const cfg = {
    baseUrl: normalizeBaseUrl(baseUrl),
    timeoutMs,
  };

  return {
    config: { ...cfg },

    // Auth
    async getToken({ username, password }) {
      if (!username || !password) {
        throw makeError({ code: "BAD_INPUT", message: "username and password are required." });
      }
      // Adjust endpoint path to match your server if different.
      return requestJson({
        baseUrl: cfg.baseUrl,
        path: "token",
        method: "POST",
        body: { username, password },
        timeoutMs: cfg.timeoutMs,
      });
    },

    // Data calls (adjust endpoint paths to your apiserver1.2 routes)
    async getRanches({ token }) {
      requireToken(token);
      return requestJson({
        baseUrl: cfg.baseUrl,
        path: "ranches",
        method: "GET",
        token,
        timeoutMs: cfg.timeoutMs,
      });
    },

    async getPlantings({ token, ranchGuid }) {
      requireToken(token);
      if (!ranchGuid) throw makeError({ code: "BAD_INPUT", message: "ranchGuid is required." });
      return requestJson({
        baseUrl: cfg.baseUrl,
        path: `plantings?ranchGuid=${encodeURIComponent(ranchGuid)}`,
        method: "GET",
        token,
        timeoutMs: cfg.timeoutMs,
      });
    },

    async getIrrigationEvents({ token, plantingId }) {
      requireToken(token);
      if (!plantingId) throw makeError({ code: "BAD_INPUT", message: "plantingId is required." });
      return requestJson({
        baseUrl: cfg.baseUrl,
        path: `irrigationEvents?plantingId=${encodeURIComponent(plantingId)}`,
        method: "GET",
        token,
        timeoutMs: cfg.timeoutMs,
      });
    },

    // Generic passthrough for any endpoint without changing this module
    async call({ token, path, method = "GET", body, headers }) {
      return requestJson({
        baseUrl: cfg.baseUrl,
        path,
        method,
        token,
        body,
        headers,
        timeoutMs: cfg.timeoutMs,
      });
    },
  };
}

// Default export (simple factory)
export default { create };
