/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    JWT_SECRET: process.env.JWT_SECRET || 'si-alat-secret-key-dev',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_USER: process.env.DB_USER || 'sialat',
    DB_PASSWORD: process.env.DB_PASSWORD || 'sialat123',
    DB_NAME: process.env.DB_NAME || 'si_alat',
  },
}

module.exports = nextConfig
