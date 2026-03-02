/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  // Add other VITE_ prefixed variables here if you have more, e.g.:
  // readonly VITE_APP_TITLE: string;
  // readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}