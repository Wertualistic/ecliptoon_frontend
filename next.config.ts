import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix workspace root detection for Turbopack
  turbopack: {
    root: "./"
  }
};

export default nextConfig;
