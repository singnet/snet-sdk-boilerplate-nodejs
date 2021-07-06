const createPackageJson = require("./createPackageJson").default;
const createEntryFile = require("./createEntryFile").default;

export const generateBoilerplateCode = async (
  orgId: string,
  serviceId: string
) => {
  await createPackageJson(serviceId);
  await createEntryFile(orgId, serviceId);
};
