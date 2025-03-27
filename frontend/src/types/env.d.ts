/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 