/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',  // Supabase Storage (crop-images, site-assets, etc.)
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // User avatar initials
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Fallback during transition
      },
    ],
  },
};

export default nextConfig;
