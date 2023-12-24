const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    content: "./src/content.js",
    background: "./src/background.js", // Added this line
  },
  output: {
    filename: "[name].bundle.js", // This will create 'content.bundle.js' and 'background.bundle.js'
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "cheap-module-source-map", // Changed from 'eval'
  // Add more configuration as needed
};
