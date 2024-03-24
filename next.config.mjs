/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{protocol: 'https', hostname:'expo-manager.b-cdn.net'}],
    }
};

export default nextConfig;
