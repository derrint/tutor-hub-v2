import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  async redirects() {
    return [
      { source: "/jadwal", destination: "/schedule", permanent: true },
      { source: "/murid", destination: "/students", permanent: true },
      { source: "/tagihan", destination: "/invoices", permanent: true },
      { source: "/laporan", destination: "/reports", permanent: true },
      { source: "/keuangan", destination: "/finance", permanent: true },
      { source: "/profile", destination: "/settings", permanent: true },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default withNextIntl(nextConfig);
