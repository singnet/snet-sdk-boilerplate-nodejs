#!/usr/bin/env node

"use strict";

const init = require("./init");

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split(".");
var major = semver[0];
var reqdVersion = "12";

// if (major < minReqdVersion) {
//   console.error(
//     "You are running Node " +
//       currentNodeVersion +
//       ".\n" +
//       "Create Snet Ai Server requires Node " +
//       minReqdVersion +
//       " or higher. \n" +
//       "Please update your version of Node."
//   );
//   process.exit(1);
// }

if (major !== reqdVersion) {
  console.error(
    "You are running Node " +
      currentNodeVersion +
      ".\n" +
      "Create Snet Ai Server requires Node " +
      reqdVersion +
      ".\n" +
      "Please change the version of your Node."
  );
  process.exit(1);
}

init();
