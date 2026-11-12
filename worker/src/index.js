export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const json = (obj, status = 200) =>
      new Response(JSON.stringify(obj), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });

    // Só aceitamos POST em todas as rotas
    if (request.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    // -------------- helpers --------------
    async function readJsonBody() {
      try { return await request.json(); } catch { return null; }
    }

    async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function randomHex(bytes = 16) {
      const a = new Uint8Array(bytes);
      crypto.getRandomValues(a);
      return [...a].map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function sha256Hex(text) {
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function requireUserFromSession() {
      if (!env.DB) return null;

      const auth = request.headers.get("Authorization") || "";
      const m = auth.match(/^Bearer\s+(.+)$/i);
      if (!m) return null;
      const token = m[1].trim();

      const row = await env.DB
        .prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?")
        .bind(token)
        .first();

      if (!row) return null;

      const now = new Date();
      const exp = new Date(row.expires_at);
      if (isNaN(exp.getTime()) || exp < now) return null;

      return { token, userId: row.user_id };
    }

    // -------------- ROUTES --------------

    // ============================================================
    // (A) ADMIN: criar usuário (Opção A) — use só para cadastrar contas
    // POST /admin/createUser
    // Header: X-Admin-Token: <ADMIN_TOKEN>
    // Body: { username, password }
    // ============================================================
    if (url.pathname === "/admin/createUser") {
      if (!env.DB) return json({ error: "Missing D1 binding env.DB" }, 500);

      const adminHeader = request.headers.get("X-Admin-Token") || "";
      if (!env.ADMIN_TOKEN || adminHeader !== env.ADMIN_TOKEN) {
        return json({ error: "Unauthorized admin" }, 401);
       }

      const body = await readJsonBody();
      if (!body?.username || !body?.password) {
        return json({ error: "Missing username/password" }, 400);
      }

      const username = String(body.username).trim().toLowerCase();
      const password = String(body.password);

      const salt = randomHex(8);
      const pass_hash = await sha256Hex(`${salt}:${password}`);
      const stored = `${salt}:${pass_hash}`; // "salt:hash"

      try {
        const r = await env.DB
          .prepare("INSERT INTO users (username, pass_hash) VALUES (?, ?)")
          .bind(username, stored)
          .run();

        return json({ ok: true, username, userId: r.meta.last_row_id }, 200);
      } catch (e) {
        return json({ error: "User insert failed", message: String(e.message || e) }, 400);
      }
    }

    // ============================================================
    // (B) LOGIN
    // POST /login
    // Body: { username, password }
    // Response: { token, userId, username, expiresAt }
    // ============================================================
    if (url.pathname === "/login") {
      if (!env.DB) return json({ error: "Missing D1 binding env.DB" }, 500);

      const body = await readJsonBody();
      if (!body?.username || !body?.password) {
        return json({ error: "Missing username/password" }, 400);
      }

      const username = String(body.username).trim().toLowerCase();
      const password = String(body.password);

      const user = await env.DB
        .prepare("SELECT id, username, pass_hash FROM users WHERE username = ?")
        .bind(username)
        .first();

      if (!user) return json({ error: "Invalid credentials" }, 401);

      const parts = String(user.pass_hash).split(":");
      if (parts.length !== 2) return json({ error: "Bad password format in DB" }, 500);

      const salt = parts[0];
      const expected = parts[1];
      const got = await sha256Hex(`${salt}:${password}`);

      if (got !== expected) return json({ error: "Invalid credentials" }, 401);

      const days = Number(env.SESSION_DAYS || 7);
      const exp = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      const token = `sess_${randomHex(24)}`;

      await env.DB
        .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(token, user.id, exp)
        .run();

      return json({ token, userId: user.id, username: user.username, expiresAt: exp }, 200);
    }

    // ============================================================
    // (C) LOG interaction  + runId (campanha)
    // POST /log
    // Header: Authorization: Bearer <sessionToken>
    // Body: { runId, npcKey, mapId, eventId, playerText, aiText, meta }
    // ============================================================
    if (url.pathname === "/log") {
      if (!env.DB) return json({ error: "Missing D1 binding env.DB" }, 500);

      const sess = await requireUserFromSession();
      if (!sess) return json({ error: "Unauthorized" }, 401);

      const body = await readJsonBody();
      if (!body?.npcKey || !body?.playerText || !body?.aiText) {
        return json({ error: "Missing npcKey/playerText/aiText" }, 400);
      }

      // NOVO: runId obrigatório
      const runId = String(body?.runId || "").trim();
      if (!runId) return json({ error: "Missing runId" }, 400);

      const npcKey = String(body.npcKey).trim();
      const mapId = body.mapId ?? null;
      const eventId = body.eventId ?? null;
      const playerText = String(body.playerText);
      const aiText = String(body.aiText);
      const metaJson = body.meta ? JSON.stringify(body.meta) : null;

      await env.DB
        .prepare(`
          INSERT INTO interactions (user_id, npc_key, map_id, event_id, player_text, ai_text, meta_json, run_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(sess.userId, npcKey, mapId, eventId, playerText, aiText, metaJson, runId)
        .run();

      return json({ ok: true }, 200);
    }

    // ============================================================
    // (D) GEMINI PROXY
    // POST /gemini   (recomendado)
    // (E) Alias: POST /  (compatível com seu plugin atual)
    //
    // Auth do proxy continua via CLIENT_TOKEN:
    // Header: Authorization: Bearer <CLIENT_TOKEN>
    //
    // Body: { model: "...", requestBody: {...} }
    // ============================================================
    if (url.pathname === "/gemini" || url.pathname === "/") {
      // auth do proxy (igual ao seu Worker atual)
      const auth = request.headers.get("Authorization") || "";
      if (!env.CLIENT_TOKEN || auth !== `Bearer ${env.CLIENT_TOKEN}`) {
        return json({ error: "Unauthorized" }, 401);
      }
      if (!env.GEMINI_API_KEY) return json({ error: "Missing GEMINI_API_KEY" }, 500);

      const body = await readJsonBody();
      if (!body) return json({ error: "Invalid JSON body" }, 400);

      const requested = (body.model && String(body.model).trim()) || "gemini-2.5-flash";
      const allowed = (env.ALLOWED_MODELS || "gemini-2.5-flash,gemini-2.0-flash")
        .split(",").map(s => s.trim()).filter(Boolean);
      const model = allowed.includes(requested) ? requested : allowed[0];

      if (!body.requestBody || typeof body.requestBody !== "object") {
        return json({ error: "Missing requestBody" }, 400);
      }

      // força maxOutputTokens mínimo
      const rb = body.requestBody;
      rb.generationConfig = rb.generationConfig || {};
      rb.generationConfig.maxOutputTokens = Math.max(Number(rb.generationConfig.maxOutputTokens ?? 0) || 0, 260);

      const upstreamUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      async function fetchWithRetry(maxRetries = 3) {
        for (let i = 0; i <= maxRetries; i++) {
          const res = await fetch(upstreamUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rb)
          });

          if (res.ok) {
            const data = await res.json();
            return { ok: true, status: 200, data };
          }

          const status = res.status;
          const text = await res.text().catch(() => "");
          const retryable = [429, 500, 502, 503, 504].includes(status);

          if (!retryable || i === maxRetries) {
            return { ok: false, status, text };
          }

          // backoff exponencial + jitter
          const wait = Math.round(400 * (2 ** i) * (0.7 + Math.random() * 0.6));
          await sleep(wait);
        }
        return { ok: false, status: 500, text: "Unknown retry failure" };
      }

      const r = await fetchWithRetry(3);

      if (r.ok) return json(r.data, 200);

      return json({
        error: "UpstreamError",
        status: r.status,
        message: (r.text || "").slice(0, 500) || "Upstream error"
      }, r.status);
    }

    // ============================================================
    // POST /history  (buscar histórico por usuário + npcKey + runId)
    // Body: { npcKey, runId, limit }
    // ============================================================
    if (url.pathname === "/history") {
      if (!env.DB) return json({ error: "Missing D1 binding env.DB" }, 500);

      const sess = await requireUserFromSession();
      if (!sess) return json({ error: "Unauthorized" }, 401);

      const body = await readJsonBody();
      const npcKey = String(body?.npcKey || "").trim();
      const runId = String(body?.runId || "").trim();
      const limit = Math.max(1, Math.min(Number(body?.limit || 6), 30)); // 1..30

      if (!npcKey) return json({ error: "Missing npcKey" }, 400);
      if (!runId) return json({ error: "Missing runId" }, 400);

      const rows = await env.DB.prepare(
        `SELECT player_text as playerText, ai_text as aiText, created_at as createdAt
         FROM interactions
         WHERE user_id = ? AND npc_key = ? AND run_id = ?
         ORDER BY id DESC
         LIMIT ?`
      ).bind(sess.userId, npcKey, runId, limit).all();

      // devolve do mais antigo -> mais novo
      const items = (rows?.results || []).slice().reverse();

      return json({ ok: true, npcKey, runId, items }, 200);
    }

    return json({ error: "Not Found" }, 404);
  }
};