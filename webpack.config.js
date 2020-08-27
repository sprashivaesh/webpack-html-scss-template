const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
    })
  })
}

const htmlPlugins = generateHtmlPlugins(path.resolve(__dirname, 'src/html/views'))

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 9000,
    hot: isDev
  },
  entry: ['@babel/polyfill', './assets/js/index.js'],
  output: {
    filename: './js/[name].[hash].js'
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  devtool: isDev ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/assets/js'),
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        include: path.resolve(__dirname, 'src/assets/images'),
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/',
            esModule: false,
          },
        },
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        include: path.resolve(__dirname, 'src/assets/fonts'),
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
            esModule: false,
          },
        },
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src/assets/styles'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader'
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        include: path.resolve(__dirname, 'src/assets/styles'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.less$/i,
        include: path.resolve(__dirname, 'src/assets/styles'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.html$/,
        include: path.resolve(__dirname, 'src/html/includes'),
        use: ['raw-loader']
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './css/[name].[contenthash].css',
      chunkFilename: './css/[id].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './assets/favicon',
          to: './favicon'
        }
      ]
    }),
    new CleanWebpackPlugin(),
  ].concat(htmlPlugins)
};