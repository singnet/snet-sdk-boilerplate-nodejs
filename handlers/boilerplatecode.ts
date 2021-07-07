import { Handler } from "aws-lambda";
import { generateNodejsBoilerplatecode } from "../services/compileGRPCStubs";
import { response, Response } from "../utils/LambdaRequestResponse";

export const create: Handler = async (event: {
  serviceId: string;
  orgId: string;
}): Promise<Response> => {
  const { orgId, serviceId } = event;
  await generateNodejsBoilerplatecode(orgId, serviceId);
  return response("OK", 200);
};
