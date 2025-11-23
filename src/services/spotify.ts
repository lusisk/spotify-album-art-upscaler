import { API_ROUTES } from "@/config/constants";

export class SpotifyTokenManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const res = await fetch(API_ROUTES.SPOTIFY_TOKEN);
    const data = await res.json();

    if (data.access_token) {
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return data.access_token;
    }

    throw new Error("Failed to get token");
  }
}
