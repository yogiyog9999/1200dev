import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app.dlist',
  appName: 'D List',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      scheme: 'dlist'    // <-- add this for deep linking
    },
    StatusBar: {
      overlaysWebView: true
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      darkModeBackgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;
