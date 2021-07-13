import { Handler } from "aws-lambda";
import { generateNodejsBoilerplatecode } from "../services/compileGRPCStubs";
import { response, Response } from "../utils/LambdaRequestResponse";

export const create: Handler = async (event: {
  serviceId: string;
  orgId: string;
  stubUrl: string;
}): Promise<Response> => {
  const { orgId, serviceId, stubUrl } = event;
  await generateNodejsBoilerplatecode(orgId, serviceId, stubUrl);
  return response("OK", 200);
};
