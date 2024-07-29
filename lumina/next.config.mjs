import withPWA from 'next-pwa';

const config = {
  dest: 'public'
};

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

export default withPWA(config)(nextConfig);