import axios from "axios";
import { syncFileWithS3 } from "../../utils/AWSS3Client";
import { createEntryFile } from "./nodejs/createEntryFile";
import { createPackageJson } from "./nodejs/createPackageJson";
const fs = require("fs");
const path = require("path");
const Zip = require("adm-zip");
const archiver = require("archiver");
const rimraf = require("rimraf");

const STUBS = "grpc_stubs";

const fetchProtoLink = async (
  orgId: string,
  serviceId: string
): Promise<string> => {
  // TODO: API integration for fetching proto file

  const downloadLink =
    "https://ropsten-service-components.s3.amazonaws.com/assets/rajeev_june_25_org/calculator_june_25/stubs/nodejs.zip";

  return downloadLink;
};

const setServiceStoragePath = async (
  orgId: string,
  serviceId: string
): Promise<string> => {
  const directory = path.resolve(__dirname, "../../", "tmp", orgId, serviceId);

  if (!fs.existsSync(directory)) {
    await fs.promises.mkdir(directory, { recursive: true });
  }

  return directory;
};

const downloadProtoZipFile = async (
  url: string,
  filePath: string
): Promise<string> => {
  try {
    const destination = `${filePath}/${STUBS}.zip`;

    const response = await axios.get(url, { responseType: "arraybuffer" });
    await fs.promises.writeFile(destination, response.data);
    return destination;
  } catch (error) {
    throw error;
  }
};

const getZipFileName = (): string => {
  return "nodejs-boilerplate.zip";
};

const packAIServicetoZip = async (servicePath: string): Promise<void> => {
  const zipFileName = getZipFileName();
  const stream = fs.createWriteStream(`${servicePath}/../${zipFileName}`);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  return new Promise<void>((resolve, reject) => {
    archive
      .directory(servicePath, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
};

const unzipProtoFile = async (
  file: string,
  unzipFilePath: string
): Promise<void> => {
  const override = true;
  const zip = new Zip(file);
  zip.extractAllTo(`${unzipFilePath}/${STUBS}`, override);
  await fs.promises.unlink(file);
};

const deleteAIServiceFiles = async (servicePath: string): Promise<void> => {
  await rimraf.sync(servicePath);
};

const s3Folder = (
  orgId: string,
  serviceId: string,
  fileName: string
): string => {
  return `assets/${orgId}/${serviceId}/stubs/${fileName}`;
};

const zippedServiceFilePath = (orgId: string, fileName: string): string => {
  const directory = path.resolve(__dirname, "../../", "tmp", orgId);
  return `${directory}/${fileName}`;
};

export const generateNodejsBoilerplatecode = async (
  orgId: string,
  serviceId: string
) => {
  try {
    const protoUrl = await fetchProtoLink(orgId, serviceId);
    const servicePath = await setServiceStoragePath(orgId, serviceId);
    const zippedProtofile = await downloadProtoZipFile(protoUrl, servicePath);
    await unzipProtoFile(zippedProtofile, servicePath);
    createPackageJson(servicePath, serviceId);
    createEntryFile(orgId, serviceId, servicePath);
    await packAIServicetoZip(servicePath);
    await deleteAIServiceFiles(servicePath);
    const aiZippedServiceName = getZipFileName();
    const s3FolderName = s3Folder(orgId, serviceId, aiZippedServiceName);
    const fileName = zippedServiceFilePath(orgId, aiZippedServiceName);
    await syncFileWithS3(fileName, s3FolderName);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
