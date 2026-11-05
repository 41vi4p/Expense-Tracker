import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.expensetracker.app',
  appName: 'ExpenseTracker',
  // Produced by `npm run build:static` (Next.js static export).
  webDir: 'out',
  android: {
    // Never allow the WebView to load insecure (http) content.
    allowMixedContent: false,
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
    },
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
