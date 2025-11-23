export const SPOTIFY_API = Object.freeze({
  TOKEN: "https://accounts.spotify.com/api/token",
  SEARCH: "https://api.spotify.com/v1/search",
});

export const ONNX_RUNTIME = Object.freeze({
  WASM_PATH: "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/",
});

export const API_ROUTES = Object.freeze({
  SPOTIFY: "/api/spotify",
  SPOTIFY_TOKEN: "/api/spotify/token",
  UPSCALE: "/api/upscale",
});

export const SEARCH_CONFIG = Object.freeze({
  LIMIT: 1,
  TYPES: "album,track",
});
