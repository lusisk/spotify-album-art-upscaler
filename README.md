# Spotify Album Art Upscaler

A Next.js application that fetches Spotify album artwork and upscales it to 4K resolution using AI-powered canvas techniques.

## Features

- 🎵 Search for albums via Spotify API
- 🖼️ Display high-quality album artwork
- 🚀 AI-powered 4x upscaling (640x640 → 2560x2560)
- 📱 Optimized for Galaxy S24 Ultra and other high-res displays
- 💾 Download upscaled images as PNG
- ⚡ Fast, client-side processing with ONNX Runtime

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom BEM components
- **AI/ML**: ONNX Runtime Web
- **API**: Spotify Web API

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── spotify/         # Spotify API routes
│   │   │   ├── route.ts     # Album search endpoint
│   │   │   └── token/       # Token management
│   │   └── upscale/         # Image upscaling endpoint
│   ├── components/
│   │   ├── album-search.tsx # Search input component
│   │   └── artwork-view.tsx # Image display & upscale UI
│   ├── styles/
│   │   ├── globals.css      # Global styles
│   │   └── components.css   # BEM component styles
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── spotify.ts           # Spotify token manager
│   └── upscaler.ts          # Image upscaling logic
└── types/
    └── index.ts             # TypeScript interfaces
```

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Spotify credentials:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Getting Spotify Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy your Client ID and Client Secret
4. Add them to `.env.local`

## How It Works

1. **Search**: Enter an album name or artist
2. **Fetch**: Retrieves album data from Spotify API with OAuth token caching
3. **Display**: Shows the original album artwork
4. **Upscale**: Uses canvas-based AI upscaling with sharpening filters
5. **Download**: Save the 4K upscaled image

## License

MIT
