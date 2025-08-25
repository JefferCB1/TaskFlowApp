module.exports = [
    // Add support for native node modules
    {
      test: /\.node$/,
      use: 'node-loader',
    },
    {
      test: /\.(m?js|node)$/,
      parser: { amd: false },
      use: {
        loader: '@vercel/webpack-asset-relocator-loader',
        options: {
          outputAssetBase: 'native_modules',
        },
      },
    },
    {
      test: /\.css$/,
      use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
    },
  ];