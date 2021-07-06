const path = require("path");
const fs = require("fs");
const os = require("os");
const indexFileTemplate = require("./template/indexTemplate").default;
const aiServiceFileTemplate = require("./template/aiServiceTemplate").default;
const configTemplate = require("./template/configTemplate").default;
const envTemplate = require("./template/envTemplate").default;
const babelRcTemplate = require("./template/babelRcTemplate").default;
const { default: serverTemplate } = require("./template/serverTemplate");

exports.default = function (orgId, serviceId, additionalConfig) {
  const root = path.resolve(".");
  fs.writeFileSync(path.join(root, "index.js"), indexFileTemplate + os.EOL);
  const serviceFile = aiServiceFileTemplate(orgId, serviceId);
  fs.writeFileSync(path.join(root, "aiService.js"), serviceFile + os.EOL);
  fs.writeFileSync(path.join(root, "config.js"), configTemplate + os.EOL);
  const envFile = envTemplate(additionalConfig);
  fs.writeFileSync(path.join(root, ".env"), envFile + os.EOL);
  fs.writeFileSync(path.join(root, ".babelrc"), babelRcTemplate + os.EOL);
  const serverFile = serverTemplate(serviceId);
  fs.writeFileSync(path.join(root, "server.js"), serverFile + os.EOL);
};
