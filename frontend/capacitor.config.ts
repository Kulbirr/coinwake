import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.coinwake',
  appName: 'CoinWake',
  webDir: '.output/public',
  server: {
    url: 'https://coinwake.onrender.com',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0b0d17',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0b0d17'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#945200' // Warm copper accent
    }
  }
};

export default config;