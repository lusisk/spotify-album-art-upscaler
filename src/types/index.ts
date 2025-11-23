export interface SpotifyAlbum {
  name: string;
  artist: string;
  imageUrl: string;
  songName?: string;
  type: "album" | "track";
}

export interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface SpotifySearchParams {
  query: string;
  token: string;
}

export interface UpscaleResult {
  url: string;
}

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
}
