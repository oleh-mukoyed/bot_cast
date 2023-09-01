import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      store: {
        get: (key: string, def?: unknown) => unknown
        set: (key: string, val: unknown) => void
      }
    }
  }
}
