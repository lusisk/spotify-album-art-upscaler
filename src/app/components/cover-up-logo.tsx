"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { SpotifyTokenManager } from "@/services/spotify";

interface Tile {
  id: number;
  imageUrl: string;
  delay: number;
}

const ICONIC_ALBUM_IDS = [
  "2QJmrSgbdM35R67eoGQo4j", // Abbey Road - The Beatles
  "6dVIqQ8qmQ5GBnJ9shOYGE", // Thriller - Michael Jackson
  "4LH4d3cOWNNsVw41Gqt2kv", // The Dark Side of the Moon - Pink Floyd
  "7gsWAHLeT0w7es6FofOXk1", // Back in Black - AC/DC
  "382ObEPsp2rxGrnsizN5TX", // DAMN. - Kendrick Lamar
  "1ATL5GLyefJaxhQzSPVrLX", // folklore - Taylor Swift
  "4SZko61aMnmgvNhfhgTuD3", // 30 - Adele
  "3RQQmkQEvNCY4prGKE6oc5", // AM - Arctic Monkeys
  "4eLPsYPBmXABThSJ821sqY", // KIDS SEE GHOSTS
  "7dK54iZuOxXFarGhXwEXfF", // When We All Fall Asleep - Billie Eilish
  "0JGOiO34nwfUdDrD612dOp", // Graduation - Kanye West
  "5MS3MvWHJ3lOZPLiMxzOU7", // After Hours - The Weeknd
  "2noRn2Aes5aoNVsU6iWThc", // Sgt. Pepper's - The Beatles
  "6FJxoadUE4JNVwWHghBwnb", // Rumours - Fleetwood Mac
  "1EoDsNmgTLtmwe1BDAVxV5", // Hotel California - Eagles
  "6kZ42qRrzov54LcAk4onW9", // Purple Rain - Prince
  "6Aj7sP2FRorFUqAPqh6DHF", // Nevermind - Nirvana
  "5zi7WsKlIiUXv09tbGLKsE", // + - Ed Sheeran
  "3JfSxDfmwS5OeHPwLSkrfr", // Random Access Memories - Daft Punk
  "6mUdeDZCsExyJLMdAfDuwh", // Born to Die - Lana Del Rey
  "7xV2TzoaVc0ycW7fwBwAml", // Harry's House - Harry Styles
  "4Hjqdhj5rh816i0bvvVZkv", // Waterloo - ABBA
  "43977e0YlJeMXG77uCCSMf", // Happier Than Ever - Billie Eilish
  "2fenSS68JI1h4Fo296JfGr", //÷ (Divide) - Ed Sheeran
  "3a0UOgDWw2pTajw85QPMiz", // Midnights - Taylor Swift
  "4g1ZRSobMefqF6nelkgibi", // 1989 - Taylor Swift
  "6pwuKxMUkNg673KETsXPUV", // Divide - Ed Sheeran
  "7txGsnDSqVMoRl6RQ9XyZP", // Blurryface - Twenty One Pilots
  "2Wjd7B3tB2hZghG8kN1WhR", // Star Boy - The Weeknd
  "4yP0hdKOZPNshxUOjY0cZj", // ? - XXXTentacion
];

function generateDesign() {
  const gridSize = 5; // 5x5 grid
  const tiles: Tile[] = [];

  const baseDelays = [
    0.0, 0.1, 0.2, 0.3, 0.4, 0.15, 0.25, 0.35, 0.45, 0.55, 0.05, 0.15, 0.25,
    0.35, 0.45, 0.2, 0.3, 0.4, 0.5, 0.6, 0.1, 0.2, 0.3, 0.4, 0.5,
  ];

  for (let i = 0; i < gridSize * gridSize; i++) {
    tiles.push({
      id: i,
      imageUrl: "",
      delay: baseDelays[i],
    });
  }

  return tiles;
}

interface CoverUpLogoProps {
  compact?: boolean;
}

export default function CoverUpLogo({ compact = false }: CoverUpLogoProps) {
  const [tiles] = useState(generateDesign);
  const [mounted, setMounted] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [albumImages, setAlbumImages] = useState<string[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem("coverup-album-images");
    if (cached) {
      try {
        const images = JSON.parse(cached);
        if (images.length >= 25) {
          setAlbumImages(images);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (albumImages.length >= 25) {
      return;
    }

    async function fetchAlbumImages() {
      try {
        const tokenManager = new SpotifyTokenManager();
        const token = await tokenManager.getToken();

        // Spotify API limit is 20 albums per request, so batch them
        const batchSize = 20;
        const batches: string[][] = [];

        for (let i = 0; i < 25; i += batchSize) {
          batches.push(ICONIC_ALBUM_IDS.slice(i, i + batchSize));
        }

        // Fetch all batches in parallel
        const batchPromises = batches.map((batch) => {
          const ids = batch.join(",");
          return axios.get(`https://api.spotify.com/v1/albums?ids=${ids}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        });

        const responses = await Promise.all(batchPromises);

        interface SpotifyAlbum {
          images: Array<{ url: string }>;
        }

        const allImages: string[] = [];

        responses.forEach((response) => {
          console.log("Response data:", response.data);

          const albums = response.data.albums;
          if (!albums || !Array.isArray(albums)) {
            console.error("No albums array in response:", response.data);
            return;
          }

          const images = albums
            .map((album: SpotifyAlbum | null) => {
              if (!album || !album.images || album.images.length === 0) {
                console.warn("Album has no images:", album);
                return "";
              }
              return album.images[1]?.url || album.images[0]?.url || "";
            })
            .filter((url) => url !== "");

          allImages.push(...images);
          console.log("Extracted images:", images);
        });

        const validImages = allImages.filter((url) => url !== "");

        console.log("All images loaded:", validImages.length, validImages);

        if (validImages.length >= 25) {
          setAlbumImages(validImages.slice(0, 25));
          // Cache in localStorage for instant loading next time
          localStorage.setItem(
            "coverup-album-images",
            JSON.stringify(validImages.slice(0, 25))
          );
        } else {
          console.warn(
            `Only got ${validImages.length} valid images, expected 25`
          );
          setAlbumImages(validImages);
          if (validImages.length > 0) {
            localStorage.setItem(
              "coverup-album-images",
              JSON.stringify(validImages)
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch album images:", error);
      }
    }

    fetchAlbumImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (albumImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentCycle((prev) => prev + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [albumImages]);

  return (
    <div className={`cover-up-logo ${compact ? "cover-up-logo--compact" : ""}`}>
      {!compact && (
        <div className="cover-up-logo__grid">
          {tiles.map((tile, index) => {
            const cycledAlbumIndex =
              albumImages.length > 0
                ? (index + currentCycle) % albumImages.length
                : index;
            const imageUrl = albumImages[cycledAlbumIndex];

            return (
              <div
                key={tile.id}
                className={`cover-up-logo__tile ${
                  mounted ? "cover-up-logo__tile--visible" : ""
                } ${!imageUrl ? "cover-up-logo__tile--loading" : ""}`}
                style={{
                  backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                  animationDelay: `${tile.delay}s`,
                }}
              />
            );
          })}
        </div>
      )}
      <div className="cover-up-logo__text">
        <h1 className="cover-up-logo__title">CoverUp</h1>
        {!compact && (
          <p className="cover-up-logo__subtitle">
            AI-Powered Album Art Upscaler
          </p>
        )}
        {compact && <span className="cover-up-logo__divider">|</span>}
        {compact && (
          <p className="cover-up-logo__subtitle">
            AI-Powered Album Art Upscaler
          </p>
        )}
      </div>
    </div>
  );
}
