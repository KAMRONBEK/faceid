import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // Include both .jsx and .js files
        include: ['**/*.jsx', '**/*.js'],
        // Configure babel if needed
        babel: {
          plugins: [],
          // This is important for handling JSX in .js files
          parserOpts: {
            plugins: ['jsx']
          }
        }
      }),
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'src': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.jsx', '.json'],
    },
    build: {
      outDir: 'build',
      // sourcemap for better debugging
      sourcemap: true,
    },
    server: {
      port: 3000,
      open: true,
      // Important for SPA routing
      historyApiFallback: true,
      proxy: {
        // Add any API proxies if needed
      },
    },
    // Configure esbuild to handle JSX in .js files
    esbuild: {
      loader: 'jsx',
      include: /.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      exclude: ['@tensorflow-models/coco-ssd', '@tensorflow/tfjs'],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    // Make env variables available
    define: {
      // Remove the need for using import.meta.env
      'process.env': env
    },
  };
}); 