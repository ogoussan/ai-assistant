const withCSS = require("@zeit/next-css");
const withFonts = require("next-fonts");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = withCSS(
  withFonts({
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'avatars.githubusercontent.com',
          port: '',
          pathname: '**'
        }
      ]
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ["javascript", "typescript"],
          filename: "static/[name].worker.js"
        })
      );

      return config;
    }
  })
);
