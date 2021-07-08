import { Handler } from "aws-lambda";
import { generateNodejsBoilerplatecode } from "../services/compileGRPCStubs";
import { response, Response } from "../utils/LambdaRequestResponse";

export const create: Handler = async (event: {
  serviceId: string;
  orgId: string;
  stub_url: string;
}): Promise<Response> => {
  const { orgId, serviceId, stub_url } = event;
  await generateNodejsBoilerplatecode(orgId, serviceId, stub_url);
  return response("OK", 200);
};
