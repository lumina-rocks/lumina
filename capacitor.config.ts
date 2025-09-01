import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lumina.rocks',
  appName: 'LUMINA',
  webDir: 'out',
  server: {
    // For development, you can point to your local server
    // url: 'http://localhost:3000',
    // cleartext: true,
    
    // For production, point to the deployed URL
    url: 'https://lumina.rocks',
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      showSpinner: false
    }
  }
};

export default config;
