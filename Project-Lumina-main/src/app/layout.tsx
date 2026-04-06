import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadowFlow Zero-Trust | Identity Intelligence Platform",
  description: "AI-powered identity resolution platform. Detect fraud clusters, map behavioral vectors, and neutralize threats with ShadowFlow's neural network.",
  keywords: ["identity resolution", "fraud detection", "zero-trust security", "neural network", "behavioral analytics"],
  authors: [{ name: "ShadowFlow Intelligence" }],
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  themeColor: "#00050A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
