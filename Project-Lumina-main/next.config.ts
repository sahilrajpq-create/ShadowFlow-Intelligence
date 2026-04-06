import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Worker files bundled via native asset modules — no worker-loader needed
  // next.js handles new Worker(new URL('...', import.meta.url)) natively
};

export default nextConfig;
