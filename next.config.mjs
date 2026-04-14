/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
  ],
  env: {
    GOOGLE_CLOUD_DISABLE_GRPC: "1",
  },
};

export default nextConfig;
