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
  // Unconditional redirects live here, never in a page. "/" depends on the
  // session cookie, so proxy.ts sends it to /progress or /programs.
  async redirects() {
    return [
      // Sign-up is the last step of onboarding.
      { source: "/auth/register", destination: "/onboarding", permanent: false },
    ];
  },
};

export default nextConfig;
