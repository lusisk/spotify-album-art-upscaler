"use client";

import { useState, useRef } from "react";
import { SpotifyTokenManager } from "@/services/spotify";
import { API_ROUTES } from "@/config/constants";
import type { SpotifyAlbum } from "@/types";

interface AlbumSearchProps {
  onResult: (data: SpotifyAlbum | null) => void;
}

export default function AlbumSearch({ onResult }: AlbumSearchProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const tokenManagerRef = useRef(new SpotifyTokenManager());

  const search = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const token = await tokenManagerRef.current.getToken();

      const res = await fetch(API_ROUTES.SPOTIFY, {
        method: "POST",
        body: JSON.stringify({ query: input, token }),
      });

      const data = await res.json();

      if (data.error) {
        console.error("Search error:", data.error);
        onResult(null);
      } else {
        onResult(data);
      }
    } catch (error) {
      console.error("Error:", error);
      onResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="album-search">
      <input
        className="album-search__input"
        placeholder="Search album name or artist..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && !loading && input.trim() && search()
        }
      />
      <button
        onClick={search}
        className="album-search__button"
        disabled={loading || !input.trim()}
      >
        {loading ? "..." : "Search"}
      </button>
    </div>
  );
}
