import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Force Turbopack workspace root to THIS project folder.
    // Prevents Next from picking an upper folder when multiple lockfiles exist.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
