var path = require('path')
var tsLintConfig = require('./tslint.json')

module.exports = {
  entry: [
    './src/index.test.ts'
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts!tslint' }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.test.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  tslint: {
    configuration: tsLintConfig,
    emitErrors: false,
    failOnHint: false,
  }
}