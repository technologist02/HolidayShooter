import { ApiClient } from "./api-client.js";
import { APP_CONFIG } from "../config/app-config.js";

export class ScoresService {
  constructor(apiClient = new ApiClient()) {
    this.apiClient = apiClient;
  }

  async saveScore(payload) {
    return this.apiClient.request("/scores", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async getTopScores(modeId, limit = APP_CONFIG.topLimit) {
    const modeQuery = modeId ? `&modeId=${encodeURIComponent(modeId)}` : "";
    return this.apiClient.request(`/scores/top?limit=${limit}${modeQuery}`);
  }

  async getRecentScores(modeId, limit = APP_CONFIG.recentLimit) {
    const modeQuery = modeId ? `&modeId=${encodeURIComponent(modeId)}` : "";
    return this.apiClient.request(`/scores/recent?limit=${limit}${modeQuery}`);
  }
}
