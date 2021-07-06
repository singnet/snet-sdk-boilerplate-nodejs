exports.default = `/**
 * dotenv must be on the top of the entry file of the project
 */
 require("dotenv").config();
 export default {
   web3Provider: process.env.PROVIDER_HOST,
   privateKey: process.env.PRIVATE_KEY,
   signerPrivateKey: process.env.SIGNER_PRIVATE_KEY,
   networkId: process.env.NETWORK_ID,
   ipfsEndpoint: process.env.IPFS_ENDPOINT,
   defaultGasPrice: process.env.DEFAULT_GAS_PRICE,
   defaultGasLimit: process.env.DEFAULT_GAS_LIMIT,
 };
 `