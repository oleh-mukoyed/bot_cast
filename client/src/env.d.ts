/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_SERVER_URL: string
  readonly MAIN_VITE_FILE_HOST_PORT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
