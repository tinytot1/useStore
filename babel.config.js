module.exports = {
  babelrcRoots: [
    // Keep the root as a root
    ".",
    // Also consider monorepo packages "root" and load their .babelrc files.
    "./packages/*"
  ],
  presets: ["@tinytot/babel-preset-config"]
};