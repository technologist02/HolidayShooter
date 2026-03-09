import { APP_CONFIG } from "../config/app-config.js";

export class ApiClient {
  constructor(baseUrl = APP_CONFIG.apiBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      ...options
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        if (data?.error) errorMessage = data.error;
      } catch {
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }
}
