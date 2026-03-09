import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";
import { sanitizeLimit, sanitizeMode, validateScorePayload } from "./validation.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || "*";

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  limit: Number(process.env.RATE_LIMIT_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin }));
app.use(express.json({ limit: "30kb" }));
app.use(limiter);

app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true, time: new Date().toISOString() });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.post("/api/scores", async (req, res) => {
  const validationError = validateScorePayload(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const playerName = String(req.body.playerName).trim();
  const modeId = String(req.body.modeId);
  const score = Number(req.body.score);
  const wave = Number(req.body.wave);
  const endedAt = new Date(String(req.body.endedAt));

  try {
    const result = await pool.query(
      `
      insert into game_scores (player_name, mode_id, score, wave, ended_at)
      values ($1, $2, $3, $4, $5)
      returning id, player_name, mode_id, score, wave, ended_at, created_at
      `,
      [playerName, modeId, score, wave, endedAt.toISOString()]
    );

    return res.status(201).json({ item: mapRow(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save score" });
  }
});

app.get("/api/scores/top", async (req, res) => {
  const limit = sanitizeLimit(req.query.limit, 10);
  const modeId = sanitizeMode(req.query.modeId);

  try {
    const result = modeId
      ? await pool.query(
          `
          select id, player_name, mode_id, score, wave, ended_at, created_at
          from game_scores
          where mode_id = $1
          order by score desc, ended_at asc
          limit $2
          `,
          [modeId, limit]
        )
      : await pool.query(
          `
          select id, player_name, mode_id, score, wave, ended_at, created_at
          from game_scores
          order by score desc, ended_at asc
          limit $1
          `,
          [limit]
        );

    return res.json({ items: result.rows.map(mapRow) });
  } catch {
    return res.status(500).json({ error: "Failed to load top scores" });
  }
});

app.get("/api/scores/recent", async (req, res) => {
  const limit = sanitizeLimit(req.query.limit, 50);
  const modeId = sanitizeMode(req.query.modeId);

  try {
    const result = modeId
      ? await pool.query(
          `
          select id, player_name, mode_id, score, wave, ended_at, created_at
          from game_scores
          where mode_id = $1
          order by created_at desc
          limit $2
          `,
          [modeId, limit]
        )
      : await pool.query(
          `
          select id, player_name, mode_id, score, wave, ended_at, created_at
          from game_scores
          order by created_at desc
          limit $1
          `,
          [limit]
        );

    return res.json({ items: result.rows.map(mapRow) });
  } catch {
    return res.status(500).json({ error: "Failed to load recent scores" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`holiday-shooter-api listening on :${port}`);
});

function mapRow(row) {
  return {
    id: row.id,
    playerName: row.player_name,
    modeId: row.mode_id,
    modeTitle: modeTitle(row.mode_id),
    score: row.score,
    wave: row.wave,
    endedAt: row.ended_at,
    createdAt: row.created_at
  };
}

function modeTitle(modeId) {
  switch (modeId) {
    case "march":
      return "8 Марта";
    case "feb":
      return "23 Февраля";
    case "new-year":
      return "Новый год";
    case "valentine":
      return "14 Февраля";
    default:
      return modeId;
  }
}
