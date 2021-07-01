require("dotenv").config();
const prompts = require("prompts");
const path = require("path");
const execSync = require("child_process").execSync;
const cliProgress = require("cli-progress");
const chalk = require("chalk");

const createPackageJson = require("./createPackageJson").default;
const createEntryFile = require("./createEntryFile").default;
const downloadGrpcStubs = require("./downloadStubFiles").default;
const { default: uploadGrpcStubs } = require("./uploadGrpcStubs");

prompts.override(require("yargs").argv);
const root = path.resolve(".");
const appName = path.basename(root);

let orgId;
let serviceId;
let additionalConfig = {};

async function promptQuestions() {
  const questions = [
    {
      type: "text",
      name: "username",
      message: "Project Name",
      initial: appName,
    },
    {
      type: "text",
      name: "orgId",
      message: "Organization ID of the service",
      validate: (value) =>
        Boolean(value.trim()) ? true : "Please enter the organization id",
    },
    {
      type: "text",
      name: "serviceId",
      message: "Service ID of the service",
      validate: (value) =>
        Boolean(value.trim()) ? true : "Please enter the service id",
    },
    {
      type: "confirm",
      name: "askConfig",
      message:
        "Do you like to enter the configs here, so that we can prefill them for you in their right places",
      initial: true,
    },
  ];
  const response = await prompts(questions);
  orgId = response.orgId.toLowerCase().trim();
  serviceId = response.serviceId.toLowerCase().trim();
  if (response.askConfig) {
    const configPromptQuestions = [
      {
        type: "text",
        name: "privateKey",
        message: "Private Key",
      },
      {
        type: "text",
        name: "infuraId",
        message: "Infura Project Id",
      },
      {
        type: "text",
        name: "freeCallToken",
        message:
          "Freecall Token (You can download it in beta.singularitynet.io)",
      },
      {
        type: "text",
        name: "tokenExpiryBlock",
        message: "Freecall Token Expiration Blocknumber",
      },

      {
        type: "text",
        name: "email",
        message: "Email used to download token",
      },
    ];

    const response = await prompts(configPromptQuestions);
    additionalConfig = response;
  }
}

function installDependencies(params) {
  execSync("npm i");
}

module.exports = async function () {
  await promptQuestions();
  const progress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progress.start(7, 0);
  createPackageJson(appName);
  progress.update(1);
  // installDependencies();
  progress.update(4);
  createEntryFile(orgId, serviceId, additionalConfig);
  progress.update(5);
  await downloadGrpcStubs(orgId, serviceId);
  await uploadGrpcStubs(serviceId);
  progress.stop();
  console.log(
    chalk.green("Success ✅ :"),
    chalk.green("Your snet server has been scaffolded successfully.")
  );
  console.log(
    chalk.white(
      "Please follow the below pointers to customize the code for your service. The same has been provided in the generated boiler plate."
    )
  );
  console.log(
    chalk.green("1:"),
    chalk.white("Update the import paths for service and message grpc stubs")
  );
  console.log(
    chalk.green("2:"),
    chalk.white(
      "Initialize the request object and the set the required input values"
    )
  );
  console.log(
    chalk.green("3:"),
    chalk.white("Change the method name according to your service")
  );
  console.log(
    chalk.green("4:"),
    chalk.white("Parse the proto get the output in the desired format")
  );
};
