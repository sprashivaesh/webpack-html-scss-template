const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

// get host
const os = require('os');
const networkInterfaces = os.networkInterfaces();
const host = networkInterfaces.en1.find(ipO => (ipO.family === 'IPv4')).address;
// get host end

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
    contentBase: path.resolve(__dirname, 'build'),
    compress: true,
    host: host,
    port: 9000,
    disableHostCheck: true
  },
  entry: ['@babel/polyfill', './assets/js/index.js'],
  output: {
    filename: './js/[name].[hash].js',
    path: path.resolve(__dirname, 'build'),
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
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
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
        test: /\.(ttf|eot|woff|woff2)$/i,
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
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            }
          },
          'css-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            }
          },
          'css-loader',
          'resolve-url-loader',
          'sass-loader?sourceMap',
        ],
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            }
          },
          'css-loader',
          'resolve-url-loader',
          'less-loader',
        ],
      },
      {
        test: /\.html$/,
        // include: path.resolve(__dirname, 'src/html/includes'),
        use: ['html-loader']
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/favicon',
          to: ''
        }
      ]
    }),
    new CleanWebpackPlugin(),
  ].concat(htmlPlugins)
};