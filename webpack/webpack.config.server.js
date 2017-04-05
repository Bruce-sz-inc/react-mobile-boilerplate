const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');
const postcssNested = require('postcss-nested');
const postcssMixins = require('postcss-mixins');
const postcssSimpleVars = require('postcss-simple-vars');
const CleanPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const rootPath = path.resolve(__dirname, '../');
const srcPath = path.join(rootPath, '/src/');
const distPath = path.join(rootPath, '/public/');

const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('./webpack.isomorphic.tools'));

const webpackConfig = {
  devtool: false,
  entry: {
    main: ['babel-polyfill', srcPath + 'index']
  },
  output: {
    path: distPath,
    filename: 'js/[chunkhash].[name].js',
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.(jsx|js)$/,
        include: srcPath,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [postcssMixins, postcssSimpleVars, postcssNested, autoprefixer]
              },
            },
          ],
          publicPath: distPath
        })
      },
      {
        test: webpackIsomorphicToolsPlugin.regular_expression('images'),
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'images/[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 4,
              },
              pngquant: {
                quality: '75-90',
                speed: 3,
              }
            }
          },
        ]
      },
      {
        test: /\.svg$/,
        include: srcPath,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'svg/[name].[ext]',
              mimetype: 'image/svg+xml'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              svgo: {
                plugins: [
                  {
                    removeUselessDefs: false
                  },
                  {
                    removeTitle: true
                  },
                  {
                    removeRasterImages: true
                  },
                  {
                    sortAttrs: true
                  }
                ]
              }
            }
          },
        ]
      },
      {
        test: /\.svg(\?[\s\S]+)?$/,
        exclude: srcPath,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'fonts/[name].[ext]',
              mimetype: 'image/svg+xml'
            }
          },
        ]
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: 'fonts/[name].[ext]'
            }
          },
        ]
      },
      {
        test: /\.(ttf|eot)(\?[\s\S]+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]'
            }
          },
        ]
      }
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        context: path.resolve(__dirname, '..')
      }
    }),
    new CleanPlugin([distPath], {
      root: rootPath
    }),
    new ExtractTextPlugin({
      filename: 'css/[chunkhash].[name].css',
      disable: false,
      ignoreOrder: true
    }),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new UglifyJsPlugin(),
    webpackIsomorphicToolsPlugin
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  }
}

module.exports = webpackConfig;
