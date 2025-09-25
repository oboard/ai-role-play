/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除或注释掉 output: 'export' 配置
  // output: 'export',
  
  // 其他配置...
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
