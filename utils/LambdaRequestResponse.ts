import { APIGatewayEvent } from "aws-lambda";

export const request = (event: APIGatewayEvent) => {
  return JSON.parse(event.body) || {};
};

export const response = (
  message: string,
  statusCode: number,
  data: any = null
) => {
  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      message,
      data,
    }),
  };
};
