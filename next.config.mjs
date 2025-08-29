/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
    // ❌ Jangan jalankan ESLint saat build / dev
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
