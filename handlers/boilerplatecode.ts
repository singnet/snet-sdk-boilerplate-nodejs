import { Handler, Context } from "aws-lambda";
import { download } from "../services/compileGRPCStubs";

export const create: Handler = async (
  event: { serviceId: string; orgId: string },
  context: Context
) => {
  const { orgId, serviceId } = event;
  await download(orgId, serviceId);
  return context.succeed({ status: true, message: "ok" });
};
