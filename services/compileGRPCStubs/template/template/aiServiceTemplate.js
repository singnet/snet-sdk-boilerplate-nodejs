const path = require("path");

exports.default = function (orgId, serviceId) {
  const orgIdPath = orgId.replace(/-/g, "_");
  const serviceIdPath = serviceId.replace(/-/g, "_");

  let root = path.resolve("./grpc_stubs/${orgIdPath}/${serviceIdPath}");
  console.log("root path", root);

  return `
  /**
   * dotenv must be on the top of the entry file of the project
   */
  import dotenv from "dotenv";
  import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
  /**
   * 1: Update the import paths for service and message grpc stubs
   */
  import service from "./grpc_stubs/${orgIdPath}/${serviceIdPath}/${serviceIdPath}_grpc_pb";
  import messages from "./grpc_stubs/${orgIdPath}/${serviceIdPath}/${serviceIdPath}_pb";
  import config from "./config";
  
  dotenv.config();
  const sdk = new SnetSDK(config);
  
  const orgId = "${orgIdPath}";
  const serviceId = "${serviceId}";
  const groupName = "default_group";
  const paymentStrategy = new DefaultPaymentStrategy(100);
  let tokenToMakeFreeCall = process.env.FREE_CALL_TOKEN ? process.env.FREE_CALL_TOKEN.toUpperCase() : "";
  tokenToMakeFreeCall = Boolean(tokenToMakeFreeCall)
    ? tokenToMakeFreeCall.startsWith("0X")
      ? tokenToMakeFreeCall
      : \`0X\${tokenToMakeFreeCall}\`
    : "";
  const serviceClientOptions = {
    tokenToMakeFreeCall,
    tokenExpirationBlock: process.env.TOKEN_EXPIRATION_BLOCK,
    email: process.env.EMAIL,
    disableBlockchainOperations: false,
    concurrency: true,
  };
  
  const closeConnection = () => {
    sdk.web3.currentProvider.connection && sdk.web3.currentProvider.connection.close();
  };
  
  export const getServiceClient = async () => {
    try {
      const serviceClient = await sdk.createServiceClient(
        orgId,
        serviceId,
        /**
        * 2: Use Correct Client from the grpc_pb.js file
        */
        service.GRPCClientConstructor,
        groupName,
        paymentStrategy,
        serviceClientOptions
      );
      return serviceClient;
    } catch (error) {
      console.log("service client create error", error);
    }
  };
  
  const exampleService = async (serviceClientWithToken) => {
    console.log("service is invoked");
    let serviceClient = serviceClientWithToken;
    try {
      if (!serviceClient) {
        serviceClient = await getServiceClient();
      }
      /**
       * 3: Initialize the request object and the set the required input values
       */
      const request = new messages.RequestType();
      /**
       * Invoke service methods
       */
      console.log("created request");
      return new Promise((resolve, reject) => {
        /**
         * 4: Change the method name according to your service
         */
        serviceClient.service.method(request, (err, result) => {
          console.log("service call error", err);
          if (err) {
            return reject(err);
          }
          resolve(result.getData());
        });
      });
    } catch (error) {
      console.log("promise error", error);
      throw error;
    }
  };
  export default exampleService;
`;
};
