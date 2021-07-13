import { APIGatewayEvent } from "aws-lambda";

export interface Response {
  statusCode: number;
  body: string;
}

export const request = (event: APIGatewayEvent): object => {
  return JSON.parse(event.body) || {};
};

export const response = (
  message: string,
  statusCode: number,
  data: any = null
): Response => {
  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      message,
      data,
    }),
  };
};
