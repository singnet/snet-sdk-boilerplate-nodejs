import { Handler } from "aws-lambda";
import { generateNodejsBoilerplatecode } from "../services/compileGRPCStubs";
import { response, Response } from "../utils/LambdaRequestResponse";

export const create: Handler = async (event: {
  serviceId: string;
  orgId: string;
  proto_url: string;
}): Promise<Response> => {
  const { orgId, serviceId, proto_url } = event;
  await generateNodejsBoilerplatecode(orgId, serviceId, proto_url);
  return response("OK", 200);
};
