"use client";

import { useState } from "react";
import AlbumSearch from "./components/album-search";
import ArtworkView from "./components/artwork-view";
import CoverUpLogo from "./components/cover-up-logo";
import type { SpotifyAlbum } from "@/types";

export default function Page() {
  const [albumData, setAlbumData] = useState<SpotifyAlbum | null>(null);

  return (
    <main className="page">
      <CoverUpLogo compact={!!albumData} />
      <AlbumSearch onResult={setAlbumData} />
      {albumData && <ArtworkView data={albumData} />}
    </main>
  );
}
