import axios from "axios";
import { SPOTIFY_API, SEARCH_CONFIG } from "@/config/constants";
import { ApiResponse } from "@/utils/api-response";

export async function POST(req: Request) {
  const { query, token } = await req.json();

  if (!token) {
    return ApiResponse.unauthorized("Access token is required");
  }

  try {
    const { data } = await axios.get(SPOTIFY_API.SEARCH, {
      params: {
        q: query,
        type: SEARCH_CONFIG.TYPES,
        limit: SEARCH_CONFIG.LIMIT,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    const track = data.tracks?.items[0];
    if (track) {
      return ApiResponse.success({
        name: track.album.name,
        artist: track.artists[0].name,
        imageUrl: track.album.images[0].url,
        songName: track.name,
        type: "track",
      });
    }

    // Fall back to album
    const album = data.albums?.items[0];
    if (album) {
      return ApiResponse.success({
        name: album.name,
        artist: album.artists[0].name,
        imageUrl: album.images[0].url,
        type: "album",
      });
    }

    return ApiResponse.notFound("No results found");
  } catch (error) {
    console.error("Search error:", error);
    return ApiResponse.serverError("Failed to search albums");
  }
}
