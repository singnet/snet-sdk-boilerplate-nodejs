const path = require("path");
const fs = require("fs");
const os = require("os");

const packageJson = {
  version: "0.1.0",
  private: true,
  main: "index.js",
  license: "MIT",
  scripts: {
    start: "nodemon --exec babel-node index.js",
    server: "nodemon --exec babel-node server.js",
  },
  dependencies: {
    dotenv: "^8.2.0",
    "snet-sdk": "^1.0.0-beta.7",
  },
  devDependencies: {
    "@babel/cli": "^7.13.10",
    "@babel/core": "^7.13.10",
    "@babel/node": "^7.13.12",
    "@babel/preset-env": "^7.13.12",
    axios: "^0.21.1",
    express: "^4.17.1",
    "google-protobuf": "^3.15.6",
    grpc: "^1.24.6",
    nodemon: "^2.0.7",
    web3: "1.3.1",
  },
};
export const createPackageJson = (directory: string, appName: string) => {
  // packageJson.name = appName;
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );
};
