import { Response, Request, NextFunction } from "express";
import { ErrorResponse } from "../models/responses/GenericResponses";
import logger from "./logger";

export const errorHandler = function (error: any, res: Response): Response {
  if (error instanceof ErrorResponse) {
    return res.status(error.error.statusCode).json(error);
  }

  logger.error(error);

  if (error.name === "WebapiError") {
    const statusCode = error.statusCode;
    const errorResponse = new ErrorResponse(`${statusCode}`, `Spotify error: ${error.message}`, statusCode);
    return res.status(errorResponse.error.statusCode).json(errorResponse);
  }

  return res.status(500).json(new ErrorResponse("500", "Internal error"));
};