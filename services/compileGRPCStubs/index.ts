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
const GRPC_SUFFIX = "_grpc_pb.js";
const SERVICE_SUFFIX = "_pb.js";

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
      throw new Error(
        `Stubs not found for service ${serviceId} on org ${orgId}`
      );
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

const getGeneratedStubNames = (
  servicePath: string,
  serviceName: string
): { grpcFile: string; serviceFile: string } => {
  const grpcStubsPath = `${servicePath}/${STUBS}`;

  let files = fs.readdirSync(grpcStubsPath);

  const stubFiles = files.filter((file) => file.includes(SERVICE_SUFFIX));

  const serviceFiles = stubFiles.filter((file) => !file.includes(GRPC_SUFFIX));
  const grpcFiles = stubFiles.filter((file) => file.includes(GRPC_SUFFIX));

  let grpcFile: string;
  let serviceFile: string;

  if (serviceFiles.length < 1) {
    throw new Error("Service files could not find");
  }

  if (grpcFiles.length < 1) {
    throw new Error("GRPC files could not find");
  }

  if (serviceFiles.length > 1) {
    serviceFile = `${serviceName}${SERVICE_SUFFIX}`;
  } else {
    serviceFile = serviceFiles[0];
  }

  if (grpcFiles.length > 1) {
    grpcFile = `${serviceName}${GRPC_SUFFIX}`;
  } else {
    grpcFile = grpcFiles[0];
  }

  return { grpcFile, serviceFile };
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
    const { grpcFile, serviceFile } = getGeneratedStubNames(
      servicePath,
      serviceId
    );
    createPackageJson(servicePath, serviceId);
    createEntryFile(orgId, serviceId, servicePath, grpcFile, serviceFile);
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
