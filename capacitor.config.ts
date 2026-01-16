import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bibliafullstack.app',
  appName: 'BíbliaFS',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // Allow connections to the API server
    allowNavigation: [
      'https://bibliafs.com.br/*',
      'https://*.supabase.co/*',
      'https://olvumxgyoazdftdyasmx.supabase.co/*'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: false,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;
