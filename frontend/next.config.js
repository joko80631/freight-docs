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

      // Exclude admin pages that don't exist
      config.module.rules.push({
        test: /\/admin\/(cron-monitoring|system-logs|user-management)\//,
        loader: 'ignore-loader',
      });
    }
    
    // Add a fallback for the 'fs' module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Add a rule to handle Handlebars
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
    });

    // Fix for require.extensions warning
    config.module.rules.push({
      test: /node_modules\/handlebars/,
      loader: 'babel-loader',
      options: {
        presets: ['next/babel'],
      },
    });

    // Handle require.extensions for Handlebars
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // Ignore require.extensions warning for Handlebars
    config.module.rules.push({
      test: /node_modules\/handlebars/,
      loader: 'ignore-loader',
    });

    return config;
  }
}

module.exports = nextConfig 