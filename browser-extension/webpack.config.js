const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background.ts',
    content: './src/content.ts',
    options: './src/options/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: 'public/manifest.json', 
          to: 'manifest.json'
        },
        { 
          from: 'public/icons', 
          to: 'icons'
        },
        { 
          from: 'public', 
          to: '.',
          globOptions: {
            ignore: ['**/popup.html', '**/options.html', '**/manifest.json', '**/icons/**']
          }
        },
        {
          from: 'src/assets',
          to: 'assets',
          noErrorOnMissing: true
        }
      ],
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false
    }),
    new HtmlWebpackPlugin({
      template: './src/options/options.html',
      filename: 'options.html',
      chunks: ['options'],
      cache: false
    })
  ],
};
