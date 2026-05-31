import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roadsos.app',
  appName: 'roadsos',
  webDir: 'dist/client',
  server: {
    url: 'http://localhost:8081',
    cleartext: true
  }
};

export default config;
