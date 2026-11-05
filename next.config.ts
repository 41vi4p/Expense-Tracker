import type { NextConfig } from "next";

// BUILD_TARGET=static produces a fully static export that is bundled into the Android app (Capacitor).
const isStatic = process.env.BUILD_TARGET === "static";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Popups are required for Google sign-in, so same-origin-allow-popups is used.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  ...(isStatic
    ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
    : {
        images: {
          remotePatterns: [
            { protocol: "https", hostname: "lh3.googleusercontent.com", port: "", pathname: "/**" },
          ],
        },
        async headers() {
          return [{ source: "/(.*)", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
