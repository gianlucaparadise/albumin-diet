/**
 * All querystring params are always strings
 */
export class BasePaginationRequest {
  limit?: string;
  offset?: string;

}

export class BaseResponse<T> {
  error?: {
    errorDescription: string;
    errorCode: string;
    statusCode: number;
  };

  data: T;

  constructor(body: T) {
    this.data = body;
  }
}

export class ErrorResponse extends BaseResponse<undefined> {
  constructor(code: string, description: string, statusCode: number = 500) {
    super(undefined);
    this.error = {
      errorCode: code,
      errorDescription: description,
      statusCode: statusCode
    };
  }
}

/**
 * Create a BadRequest error with code 400
 */
export class BadRequestErrorResponse extends ErrorResponse {
  constructor(description: string) {
    super("400", description, 400);
  }
}

export class EmptyResponse extends BaseResponse<undefined> {
  constructor() {
    super(undefined);
  }
}