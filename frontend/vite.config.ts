import { defineConfig, loadEnv, UserConfig, ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'src': path.resolve(__dirname, 'src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    build: {
      outDir: 'build',
      // sourcemap for better debugging
      sourcemap: true,
    },
    server: {
      port: 3000,
      open: true,
    },
    // Configure esbuild to properly handle TypeScript
    esbuild: {
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      tsconfigRaw: {
        compilerOptions: {
          jsx: 'react',
          target: 'esnext'
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.ts': 'tsx',
          '.jsx': 'jsx',
          '.tsx': 'tsx',
        },
        jsx: 'transform',
        target: 'esnext',
        tsconfigRaw: {
          compilerOptions: {
            jsx: 'react',
            target: 'esnext'
          }
        }
      },
    },
    // Make env variables available
    define: {
      'process.env': env
    },
  };
}); 