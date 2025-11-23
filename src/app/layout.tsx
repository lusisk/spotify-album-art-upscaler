import "./styles/globals.css";
import "./styles/components.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Album Art Upscaler",
  description: "Fetch and upscale Spotify album artwork",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white min-h-screen flex items-center justify-center p-6">
        {children}
      </body>
    </html>
  );
}
