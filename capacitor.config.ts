import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'rocks.lumina.app',
  appName: 'LUMINA',
  webDir: 'public',
  server: {
    url: 'https://lumina.rocks',
    cleartext: true
  }
};

export default config;
