import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutrio.app',
  appName: 'Nutrio',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#10b981",
      showSpinner: false
    }
  }
};

export default config;
