require("dotenv").config({path:__dirname+'/../.env'});
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

var params = {
  localDir: "./grpc_stubs/",
  s3Params: {
    Bucket: process.env.AWS_BUCKET_GRPC_STUBS,
  },
};

exports.default = async function (orgId = "6ce80f485dae487688c3a083688819bb", serviceId = "test_freecall") {
  orgIdPath = orgId.replace(/-/g, "_");
  serviceIdPath = serviceId.replace(/-/g, "_");
  var downloader = client.downloadDir(params);
  // let root = path.resolve(`./grpc_stubs`);
  // const paths = await globby([`${root}`])
  //     const pathsToDelete = [...new Set(paths.map(el=>path.resolve(`${el}/../..`)))];
  //     const isEmptyDir = el => fs.readdirSync(el).length === 0;
  //     pathsToDelete.forEach(el=>{
  //       console.log("path check", el);
  //       if(isEmptyDir(el)){
  //         console.log("rimraf", el);
  //         // rimraf.sync(el)
  //       }
  //     })
  // return

  let prevProgress = 0;

  return new Promise(function (resolve, reject) {
    downloader.on("error", function (err) {
      console.error("unable to download:", err.stack);
      return reject(err.message);
    });
    downloader.on("progress", function () {
      const progressPercent = (Number(downloader.progressAmount) / Number(downloader.progressTotal)) * 100;
      if (!isNaN(progressPercent) && progressPercent - prevProgress > 0.5) {
        console.log("progress", progressPercent.toFixed(2), "%");
        prevProgress = progressPercent;
      }
    });
    downloader.on("end", async function () {
      let root = path.resolve(`./grpc_stubs`);

      let paths = await globby([`${root}`, `!${root}/${orgIdPath}/${serviceIdPath}`]);

      let pathsToDelete = [...new Set(paths.map((el) => path.resolve(`${el}/..`)))];

      for (let index = 0; index < pathsToDelete.length; index++) {
        const pathToDelete = pathsToDelete[index];
        rimraf.sync(pathToDelete);
      }
      /** Delete the Empty left over folders */
      // paths = await globby([`${root}`])
      // pathsToDelete = [...new Set(paths.map(el=>path.resolve(`${el}/../..`)))];
      // const isEmptyDir = el => fs.readdirSync(el).length === 0;
      // pathsToDelete.forEach(el=>{
      //   console.log("path check", el);
      //   if(isEmptyDir(el)){
      //     rimraf.sync(el)
      //   }
      // })

      resolve(paths);
    });
  });
};
