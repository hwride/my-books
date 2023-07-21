import { withSentryConfig } from '@sentry/nextjs'
import { serverEnv } from "./env/serverEnv.mjs";

await import("./env/env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 60 * 60, // Cache images for 1 hour
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.backblazeb2.com',
        port: '',
        pathname: `/file/${serverEnv.BACKBLAZE_BUCKET_NAME}/**`,
      },
    ],
  },
}

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: 'personal-mj6',
    project: 'my-books',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
)
