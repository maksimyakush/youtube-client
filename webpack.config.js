module.exports = {
  entry: {
    filename: './scripts/script.js',
  },
  output: {
    filename: './bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
      },
    ],
  },
};
