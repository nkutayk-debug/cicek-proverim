import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  // eski vercel.app adresi kalıcı olarak alan adına gider (çift içerik olmasın)
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host" as const, value: "cicek-proverim.vercel.app" }], destination: "https://cicekcosturan.proverim.com.tr/:path*", permanent: true }];
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
