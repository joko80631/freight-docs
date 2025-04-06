/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    
    // Exclude test files and mocks from production builds
    if (!dev) {
      config.module.rules.push({
        test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
        loader: 'ignore-loader',
      });
      
      // Exclude mocks directory
      config.module.rules.push({
        test: /\/mocks\//,
        loader: 'ignore-loader',
      });
      
      // Exclude scripts directory
      config.module.rules.push({
        test: /\/scripts\//,
        loader: 'ignore-loader',
      });
    }
    
    return config;
  }
}

module.exports = nextConfig 