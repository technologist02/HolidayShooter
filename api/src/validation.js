const modeIds = new Set(["march", "feb", "new-year", "valentine"]);

export function validateScorePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Body is required";
  }

  const playerName = String(payload.playerName ?? "").trim();
  const modeId = String(payload.modeId ?? "");
  const score = Number(payload.score);
  const wave = Number(payload.wave);
  const endedAt = String(payload.endedAt ?? "");

  if (playerName.length < 2 || playerName.length > 20) {
    return "playerName must be 2-20 chars";
  }

  if (!modeIds.has(modeId)) {
    return "modeId is invalid";
  }

  if (!Number.isInteger(score) || score < 0 || score > 100000000) {
    return "score must be positive integer";
  }

  if (!Number.isInteger(wave) || wave < 1 || wave > 100000) {
    return "wave must be positive integer";
  }

  const parsedDate = new Date(endedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return "endedAt is invalid";
  }

  return null;
}

export function sanitizeLimit(rawValue, defaultValue) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) return defaultValue;
  return Math.min(value, 100);
}

export function sanitizeMode(modeId) {
  if (!modeId) return null;
  return modeIds.has(modeId) ? modeId : null;
}
