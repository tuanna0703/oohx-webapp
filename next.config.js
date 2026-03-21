/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Transpile leaflet.markercluster since it uses CommonJS
  transpilePackages: ['leaflet', 'react-leaflet'],
}

module.exports = nextConfig
