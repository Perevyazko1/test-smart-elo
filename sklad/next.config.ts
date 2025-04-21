import withPWA from 'next-pwa';


const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    // skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/ms/:path*',
                destination: 'https://api.moysklad.ru/api/remap/1.2/:path*',
            },
        ];
    },
    images: {
        domains: ['miniature-prod.moysklad.ru'],
    },
};

export default pwaConfig(nextConfig);