import { Handler, Context } from "aws-lambda";
import { generateNodejsBoilerplatecode } from "../services/compileGRPCStubs";

export const create: Handler = async (
  event: { serviceId: string; orgId: string },
  context: Context
): Promise<any> => {
  const { orgId, serviceId } = event;
  await generateNodejsBoilerplatecode(orgId, serviceId);
  return context.succeed({ status: true, message: "ok" });
};
