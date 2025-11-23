# CoverUp

**AI-Powered Spotify Album Art Upscaler**

A Next.js application that fetches Spotify album artwork and upscales it for a specific device resolution using AI-powered canvas techniques.

## Features

- 🎨 **Animated Brand Identity**: Dynamic mosaic logo featuring 30 iconic album covers with smooth cycling animations
- 🎵 **Smart Album Search**: Search for albums via Spotify API with intelligent caching
- 🖼️ **High-Quality Artwork**: Display original album artwork at maximum resolution
- 🚀 **AI-Powered Upscaling**: Dynamic scaling (up to 5x) using Web Worker-based canvas upscaling with sharpening filters
- 📱 **Device Presets**: Optimized for iPhone 16 series, Samsung Galaxy S25/S24, Pixel 9, iPad, and Desktop displays
- 💾 **Instant Downloads**: Save upscaled images as PNG files
- 📲 **QR Code Sharing**: Generate QR codes for instant mobile downloads via local network
- ⚡ **Fast Performance**: Client-side processing with IndexedDB storage for large images
- 🎭 **Smooth Transitions**: Logo transitions to compact header mode when viewing album art

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Image Processing**: Web Workers with OffscreenCanvas for high-performance upscaling
- **Storage**: IndexedDB for large image blobs, localStorage for app state caching
- **QR Codes**: qrcode library for generating shareable download links
- **API**: Spotify Web API with OAuth token management
- **HTTP Client**: Axios for API requests

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
│   │   ├── artwork-view.tsx      # Image display, upscale UI & QR generation
│   │   └── cover-up-logo.tsx     # Animated logo with album art mosaic
│   ├── download/
│   │   └── [id]/
│   │       └── page.tsx          # QR code download handler
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   └── components.css        # BEM component styles & animations
│   ├── layout.tsx
│   └── page.tsx                  # Main page layout
├── config/
│   ├── constants.ts              # API routes and configuration
│   └── devices.ts                # Device resolution presets (iPhone, Samsung, Pixel, etc.)
├── lib/
│   └── upscaler.ts               # Web Worker manager for image upscaling
├── services/
│   └── spotify.ts                # SpotifyTokenManager service
├── utils/
│   ├── api-response.ts           # API response helper utility
│   ├── indexeddb.ts              # IndexedDB storage for large image blobs
│   └── qr-code.ts                # QR code generation utilities
├── workers/
│   └── upscale.worker.ts         # Web Worker for canvas-based upscaling
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
4. **Customize**: Select a device preset (iPhone 16, Samsung S25, Pixel 9, iPad, Desktop) or enter custom dimensions
5. **AI Upscale**: Click "AI Upscale" to process the image using Web Worker-based upscaling with sharpening filters
6. **Download Options**:
   - **Direct Download**: Save the upscaled image as PNG to your computer
   - **QR Code Download**: Generate a QR code to download on your mobile device via local network

### QR Code Mobile Download

1. **Generate**: After upscaling, click "Scan QR Code" to open the QR modal
2. **Store**: Image is stored in IndexedDB (supports large files up to 50MB+)
3. **Scan**: Use your phone camera to scan the QR code
4. **Download**: Phone opens download page on local network and automatically downloads the image
5. **Auto-Expire**: QR codes and stored images expire after 1 hour for privacy

### Technical Details

- **Web Worker Processing**: Image upscaling runs in a separate thread using OffscreenCanvas for non-blocking performance
- **Sharpening Filter**: Applies convolution kernel for enhanced detail after upscaling
- **Dynamic Scaling**: Automatically calculates scale factor based on target device (2x-5x)
- **IndexedDB Storage**: Stores large upscaled images (no size limit issues like localStorage)
- **OAuth Token Management**: Automatic Spotify API token refresh with client-side caching
- **Batched API Requests**: Efficient fetching of album cover data in 20-item batches for logo animation
- **SSR-Safe Rendering**: Hydration-safe design with shimmer loading states
- **Progressive Enhancement**: Graceful fallbacks for loading states and missing images

## License

MIT
