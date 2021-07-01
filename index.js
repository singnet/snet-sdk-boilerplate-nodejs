"use strict";

import dotenv from "dotenv";

const shell = require("shelljs");

dotenv.config();

const askConfig = true;

const privateKey = process.env.PRIVATE_KEY;
const infuraId = process.env.INFURA_ID;
const freeCallToken = process.env.FREE_CALL_TOKEN;
const tokenExpiryBlock = process.env.TOKEN_EXPIRY_BLOCK;
const email = process.env.EMAIL;

const downloadNodeBoilerplateCode = async (orgId, serviceId) => {
  try {
    const folder = "services";
    shell.chmod("777", folder);
    shell.cd(folder);

    shell.mkdir(serviceId);
    shell.chmod("777", serviceId);
    shell.cd(serviceId);
    shell.exec(
      `create-snet-ai-server --username ${serviceId} --orgId ${orgId} --serviceId ${serviceId} --askConfig ${askConfig} --privateKey ${privateKey} --infuraId ${infuraId} --freeCallToken ${freeCallToken} --tokenExpiryBlock ${tokenExpiryBlock} --email ${email}`
    );
    shell.cd("../");
    shell.exit(1);
  } catch (e) {
    throw e;
  }
};
