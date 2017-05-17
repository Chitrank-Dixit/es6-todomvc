/* eslint no-console:"off" */
const {resolve} = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackValidator = require('webpack-validator');
const {getIfUtils, removeEmpty} = require('webpack-config-utils');
const OfflinePlugin = require('offline-plugin');

// there is a tool that validate the webpack properly the tool is webpack validator

// validate-webpack:dev to validate webpack at the development environment just run $ npm run validate-webpack:dev

// tree shaking will allow to reduce bundle (build or dist) sizes for large builds by analyzing exports and imports
// The less code you can send to the browser, the better. The concept of tree shaking basically says that if you’re not using some piece of code,
// then exclude it from the final bundle, even when that piece of code is exported from a module. Because ES6 modules are statically analyzable,
// Webpack can determine which of your dependencies are used and which are not. In this lesson, see how to take advantage of this awesome feature in Webpack 2

module.exports = env => {
  const {ifProd, ifNotProd} = getIfUtils(env)
  const config = webpackValidator({
    context: resolve('src'),
    entry: {
      app: './bootstrap.js',
      vendor: ['todomvc-app-css/index.css'],
    },
    output: {
      filename: ifProd('bundle.[name].[chunkhash].js', 'bundle.[name].js'),
      path: resolve('dist'),
      pathinfo: ifNotProd(),
    },
    devtool: ifProd('source-map', 'eval'),
    module: {
      loaders: [
        {test: /\.js$/, loaders: ['babel'], exclude: /node_modules/},
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style',
            loader: 'css',
          })
        },
      ],
    },
    plugins: removeEmpty([
      new ProgressBarPlugin(),
      new ExtractTextPlugin(ifProd('styles.[name].[chunkhash].css', 'styles.[name].css')),
      ifProd(new InlineManifestWebpackPlugin()),
      ifProd(new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
      })),
      new HtmlWebpackPlugin({
        template: './index.html',
        inject: 'head',
      }),
      new OfflinePlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: ifProd('"production"', '"development"')
        }
      }),
    ]),
  })
  if (env.debug) {
    console.log(config)
    debugger // eslint-disable-line
  }
  return config
}
