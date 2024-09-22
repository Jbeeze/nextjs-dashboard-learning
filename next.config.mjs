/** @type {import('next').NextConfig} */

const nextConfig = {
    // Allows you to adopt PPR (partial pre-rendering) for specific routes
    experimental: {
        ppr: 'incremental',
    },
};

export default nextConfig;
