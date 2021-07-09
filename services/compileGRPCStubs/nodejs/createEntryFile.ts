const fs = require("fs");
const os = require("os");
const path = require("path");

import { indexFileTemplate } from "./template/indexTemplate";
import { aiServiceTemplate } from "./template/aiServiceTemplate";
import { configTemplate } from "./template/configTemplate";
import { envTemplate } from "./template/envTemplate";
import { babelRcTemplate } from "./template/babelRcTemplate";
import { serverTemplate } from "./template/serverTemplate";

export const createEntryFile = (
  orgId: string,
  serviceId: string,
  directory: string,
  grpcFile: string,
  protoFile: string
) => {
  try {
    const root = directory;
    fs.writeFileSync(path.join(root, "index.js"), indexFileTemplate + os.EOL);

    const serviceFile = aiServiceTemplate(
      orgId,
      serviceId,
      grpcFile,
      protoFile
    );
    fs.writeFileSync(path.join(root, "aiService.js"), serviceFile + os.EOL);

    fs.writeFileSync(path.join(root, "config.js"), configTemplate + os.EOL);

    const envFile = envTemplate();
    fs.writeFileSync(path.join(root, ".env"), envFile + os.EOL);

    fs.writeFileSync(path.join(root, ".babelrc"), babelRcTemplate + os.EOL);

    const serverFile = serverTemplate(serviceId);
    fs.writeFileSync(path.join(root, "server.js"), serverFile + os.EOL);
  } catch (error) {
    throw error;
  }
};
