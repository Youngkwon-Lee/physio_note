/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'], 
  typescript: {
    ignoreBuildErrors: true, // 타입스크립트 빌드 오류 무시
  },
};

module.exports = nextConfig; 