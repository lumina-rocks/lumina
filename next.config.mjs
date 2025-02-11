import withPWA from 'next-pwa';

const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '/**',
          },
        ],
      },
};

export default (nextConfig);