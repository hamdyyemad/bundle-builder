import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is for the Docker image. Vercel builds its own serverless
  // output and does not want this, so only set it off-Vercel.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
