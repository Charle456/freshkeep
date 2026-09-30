import type { CapacitorConfig } from '@capacitor/cli'
import { APP_METADATA } from './src/data/app-metadata.ts'

const config: CapacitorConfig = {
  appId: APP_METADATA.bundleId,
  appName: APP_METADATA.name,
  webDir: 'dist',
  ios: {
    scheme: 'FreshKeep',
  },
  plugins: {
    LocalNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
