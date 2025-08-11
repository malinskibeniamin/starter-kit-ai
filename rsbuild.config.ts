import { defineConfig, loadEnv } from '@rsbuild/core';

import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import { pluginDevtoolsJson } from 'rsbuild-plugin-devtools-json';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [
    pluginReact({
      reactRefreshOptions: {
        forceEnable: true,
      },
    }),
    pluginSvgr({ mixedImport: true }),
    pluginDevtoolsJson(),
  ],
  dev: {
    hmr: true,
  },
  html: {
    template: './public/index.html',
  },
  server: {
    htmlFallback: 'index',
    port: 3001,
  },
  source: {
    define: publicVars,
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [require('@tailwindcss/postcss'), require('autoprefixer')],
      },
    },
    rspack: {
      /* resolve symlinks so the proto generate code can be built. */
      resolve: {
        symlinks: false,
      },
      plugins: [
        new NodePolyfillPlugin({
          additionalAliases: ['process'],
        }),
        process.env.RSDOCTOR &&
          new RsdoctorRspackPlugin({
            supports: {
              /**
               * @see https://rsdoctor.dev/config/options/options#generatetilegraph
               */
              generateTileGraph: true,
            },
          }),
      ].filter(Boolean),
      module: {
        rules: [
          {
            // Match .png asset
            // You can change this regular expression to match different types of files
            test: /\.png$/,
            type: 'asset/resource',
            generator: {
              filename:
                process.env.NODE_ENV === 'production' ? 'static/media/[name].[hash][ext]' : 'static/media/[name].[ext]',
            },
          },
        ],
      },
    },
  },
});
