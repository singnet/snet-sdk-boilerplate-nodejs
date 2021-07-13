import * as fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS } from "../config/aws";

export const syncFileWithS3 = async (
  fileName: string,
  destinationFolder: string = ""
): Promise<void> => {
  const s3 = new S3Client({
    region: AWS.REGION,
    credentials: {
      accessKeyId: AWS.ACCESS_KEY_ID,
      secretAccessKey: AWS.SECRET,
    },
  });

  const fileContent = fs.readFileSync(fileName);

  const command = new PutObjectCommand({
    Bucket: AWS.BUCKET,
    Body: fileContent,
    Key: destinationFolder,
  });

  try {
    await s3.send(command);
  } catch (error) {
    throw error;
  }
};
