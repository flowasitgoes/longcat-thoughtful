import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.longcat.game',
  appName: 'Longcat Game',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
