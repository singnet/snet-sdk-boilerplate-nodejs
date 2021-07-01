require("dotenv").config({ path: __dirname + "/../.env" });
const path = require("path");
const fs = require("fs");
var s3 = require("s3-client");
var rimraf = require("rimraf");
const globby = require("globby");

var client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  },
});

exports.default = async function (serviceId) {
  return new Promise(function (resolve, reject) {
    rimraf(path.resolve("./node_modules"), function () {
      var params = {
        localDir: "./",
        deleteRemoved: true, // default false, whether to remove s3 objects
        // that have no corresponding local file.
        s3Params: {
          Bucket: process.env.UPLOAD_BUCKET_NAME,
          Prefix: serviceId,
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
      };
      var uploader = client.uploadDir(params);
      uploader.on("error", function (err) {
        console.error("unable to sync:", err.stack);
        reject(err.stack);
      });
      uploader.on("progress", function () {
        const progressPercent =
          (Number(uploader.progressAmount) / Number(uploader.progressTotal)) *
          100;
      });
      uploader.on("end", function () {
        console.log(`${serviceId} uploaded`);
      });
      resolve("Files synced");
    });
  });
};
