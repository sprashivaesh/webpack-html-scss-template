const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')

const CopyWebpackPlugin = require('copy-webpack-plugin');

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

const htmlPlugins = generateHtmlPlugins('./src/html/views')

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  entry: [
    './src/js/index.js'
  ],
  output: {
    filename: './js/[name].[contenthash].js'
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        include: path.resolve(__dirname, 'src/fonts'),
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
        test: /\.s[ac]ss$/i,
        include: path.resolve(__dirname, 'src/scss'),
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
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
          from: './src/favicon',
          to: './favicon'
        },
        {
          from: './src/img',
          to: './img'
        },
        {
          from: './src/uploads',
          to: './uploads'
        }
      ]
    }),
  ].concat(htmlPlugins)
};