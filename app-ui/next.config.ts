import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence workspace root warning by explicitly setting tracing root to repo root
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
