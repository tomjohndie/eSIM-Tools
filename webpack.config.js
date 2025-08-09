const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    main: './src/js/main.js',
    giffgaff: './src/js/giffgaff.js',
    simyo: './src/js/simyo.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'gzip',
      threshold: 10240,
      minRatio: 0.8
    }),
    new GenerateSW({
      swDest: 'sw.js',
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.qrserver\.com/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'qr-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\.giffgaff\.com/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'giffgaff-api',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        },
        {
          urlPattern: /^https:\/\/appapi\.simyo\.nl/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'simyo-api',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.css']
  },
  devtool: 'source-map'
}; 