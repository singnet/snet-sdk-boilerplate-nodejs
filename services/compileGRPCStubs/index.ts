import axios from "axios";
import { syncFileWithS3 } from "../../utils/AWSS3Client";
import * as fs from "fs";
import { createEntryFile } from "./nodejs/createEntryFile";
import { createPackageJson } from "./nodejs/createPackageJson";
import * as os from "os";
import { API } from "../../config/api";
const Zip = require("adm-zip");
const archiver = require("archiver");
const rimraf = require("rimraf");

const STUBS = "grpc_stubs";

const tmp = os.tmpdir();

enum STUB_TYPE {
  NODEJS = "grpc-stub/nodejs",
}

const fetchProtoLink = async (
  orgId: string,
  serviceId: string
): Promise<string> => {
  try {
    const endpoint = `${API}/org/${orgId}/service/${serviceId}`;
    const response = await axios.get(endpoint);

    const { media } = response.data.data;

    const nodejsStub = media.filter(
      (file: { asset_type: STUB_TYPE }) => file.asset_type === STUB_TYPE.NODEJS
    )[0];

    if (nodejsStub) {
      return nodejsStub.url;
    } else {
      throw `Stubs not found for service ${serviceId} on org ${orgId}`;
    }
  } catch (e) {
    throw e;
  }
};

const setServiceStoragePath = async (
  orgId: string,
  serviceId: string
): Promise<string> => {
  const directory = `${tmp}/${orgId}/${serviceId}`;

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
  const directory = `${tmp}/${orgId}`;
  return `${directory}/${fileName}`;
};

const findFile = (files: string[], pattern: string): string => {
  for (const file of files) {
    if (file.includes(pattern)) {
      return file;
    }
  }
  throw "File not found";
};

const findGRPCFile = (files: string[]): string => {
  return findFile(files, "grpc_pb.js");
};

const findServiceFile = (files: string[]): string => {
  return findFile(files, "service_pb.js");
};

const getGeneratedStubNames = (
  servicePath: string
): { grpcFile: string; protoFile: string } => {
  const grpStubsPath = `${servicePath}/${STUBS}`;

  const files = fs.readdirSync(grpStubsPath);

  const grpcFile = findGRPCFile(files);
  const protoFile = findServiceFile(files);

  return { grpcFile, protoFile };
};

export const generateNodejsBoilerplatecode = async (
  orgId: string,
  serviceId: string,
  protoUrl: string
) => {
  try {
    const servicePath = await setServiceStoragePath(orgId, serviceId);
    const zippedProtofile = await downloadProtoZipFile(protoUrl, servicePath);
    await unzipProtoFile(zippedProtofile, servicePath);
    const { grpcFile, protoFile } = getGeneratedStubNames(servicePath);
    createPackageJson(servicePath, serviceId);
    createEntryFile(orgId, serviceId, servicePath, grpcFile, protoFile);
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
