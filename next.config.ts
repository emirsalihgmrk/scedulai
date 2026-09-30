import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" }, // video thumbnails
      { protocol: "https", hostname: "yt3.ggpht.com" }, // channel avatars
      { protocol: "https", hostname: "images.unsplash.com" }, // program covers
    ],
  },
  // Unconditional redirects live here, never in a page.
  async redirects() {
    return [
      { source: "/", destination: "/programs", permanent: false },
      // Sign-up is the last step of onboarding.
      { source: "/auth/register", destination: "/onboarding", permanent: false },
    ];
  },
};

export default nextConfig;
