import {withSentryConfig} from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle platform-specific Remotion packages
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // Darwin (macOS)
        "@remotion/compositor-darwin-x64": false,
        "@remotion/compositor-darwin-arm64": false,

        // Linux
        "@remotion/compositor-linux-x64": false,
        "@remotion/compositor-linux-arm64": false,
        "@remotion/compositor-linux-x64-musl": false,
        "@remotion/compositor-linux-arm64-musl": false,
        "@remotion/compositor-linux-x64-gnu": false,
        "@remotion/compositor-linux-arm64-gnu": false,

        // Windows
        "@remotion/compositor-win32-x64": false,
        "@remotion/compositor-windows-x64": false,

        // Handle esbuild
        esbuild: false,
      },
    };

    // Add esbuild to external modules
    if (isServer) {
      config.externals = [...config.externals, "esbuild"];
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@remotion/bundler",
      "@remotion/renderer",
      "esbuild",
    ],
  },
};

// Only wrap with Sentry config if Sentry is enabled
const shouldUseSentry = process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true" && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT;

export default shouldUseSentry ? withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG,

  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: process.env.SENTRY_WIDEN_CLIENT_FILE_UPLOAD !== "false",

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: process.env.SENTRY_TUNNEL_ROUTE || "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: process.env.SENTRY_DISABLE_LOGGER !== "false",

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: process.env.SENTRY_AUTOMATIC_VERCEL_MONITORS !== "false",
}) : nextConfig;