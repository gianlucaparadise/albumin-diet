import { Response, Request, NextFunction } from "express";
import { ErrorResponse } from "../models/responses/GenericResponses";
import logger from "./logger";

export const errorHandler = function (error: any, res: Response): Response {
  if (error instanceof ErrorResponse) {
    return res.status(error.error.statusCode).json(error);
  }

  logger.error(error);
  return res.status(500).json(new ErrorResponse("500", "Internal error"));
};