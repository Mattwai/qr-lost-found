import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/QR-:id",
        destination: "/found?qr=QR-:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
