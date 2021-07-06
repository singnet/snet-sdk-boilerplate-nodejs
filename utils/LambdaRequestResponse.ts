import { APIGatewayEvent } from "aws-lambda";

export const request = (event: APIGatewayEvent): object => {
  return JSON.parse(event.body) || {};
};

export const response = (
  message: string,
  statusCode: number,
  data: any = null
): object => {
  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      message,
      data,
    }),
  };
};
