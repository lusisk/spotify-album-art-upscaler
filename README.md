# CoverUp

**AI-Powered Spotify Album Art Upscaler**

A Next.js application that fetches Spotify album artwork and upscales it for a specific device resolution using AI-powered canvas techniques.

## Features

- 🎨 **Animated Brand Identity**: Dynamic mosaic logo featuring 30 iconic album covers with smooth cycling animations
- 🎵 **Smart Album Search**: Search for albums via Spotify API with intelligent caching
- 🖼️ **High-Quality Artwork**: Display original album artwork at maximum resolution
- 🚀 **AI-Powered Upscaling**: 4x upscaling (640x640 → 2560x2560) using ONNX Runtime
- 📱 **Device Presets**: Optimized for iPhone, Samsung Galaxy, Pixel, iPad, and Desktop displays
- 💾 **Instant Downloads**: Save upscaled images as PNG files
- ⚡ **Fast Performance**: Client-side processing with localStorage caching for instant subsequent loads
- 🎭 **Smooth Transitions**: Logo transitions to compact header mode when viewing album art

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind
- **AI/ML**: ONNX Runtime Web for upscaling
- **API**: Spotify Web API with OAuth token management

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── spotify/
│   │   │   ├── route.ts          # Album search endpoint
│   │   │   └── token/
│   │   │       └── route.ts      # Token management endpoint
│   │   └── upscale/
│   │       └── route.ts          # Image upscaling endpoint
│   ├── components/
│   │   ├── album-search.tsx      # Search input component
│   │   ├── artwork-view.tsx      # Image display & upscale UI
│   │   └── cover-up-logo.tsx     # Animated logo with album art mosaic
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   └── components.css        # BEM component styles & animations
│   ├── layout.tsx
│   └── page.tsx                  # Main page layout
├── config/
│   ├── constants.ts              # API routes and configuration
│   └── devices.ts                # Device resolution presets
├── lib/
│   └── upscaler.ts               # Image upscaling logic with ONNX
├── services/
│   └── spotify.ts                # SpotifyTokenManager service
├── utils/
│   └── api-response.ts           # API response helper utility
└── types/
    └── index.ts                  # TypeScript interfaces
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

### Initial Experience

1. **Animated Logo**: Upon landing, see the CoverUp logo with a 5×5 grid of iconic album covers
2. **Live Cycling**: Album covers rotate with new artwork every 3 seconds, creating a dynamic visual experience
3. **Smart Caching**: After first load, album cover data is cached for instant subsequent page loads

### Album Upscaling Workflow

1. **Search**: Enter an album name or artist in the search bar
2. **Select**: Choose from search results to load the album artwork
3. **Transition**: Logo smoothly transitions to a compact header in the top-right corner
4. **Customize**: Select a device preset (iPhone, Samsung, Pixel, iPad, Desktop) or enter custom dimensions
5. **AI Upscale**: Click "AI Upscale" to process the image using ONNX-powered upscaling (640x640 → 2560x2560)
6. **Download**: Save your enhanced 4K album artwork as a PNG file

### Technical Details

- **OAuth Token Management**: Automatic Spotify API token refresh with client-side caching
- **Batched API Requests**: Efficient fetching of album cover data in 20-item batches
- **SSR-Safe Rendering**: Hydration-safe design with shimmer loading states
- **Progressive Enhancement**: Graceful fallbacks for loading states and missing images

## License

MIT
