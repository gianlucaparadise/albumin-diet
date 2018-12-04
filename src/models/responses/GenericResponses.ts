export class BaseResponse<T> {
  error?: {
    errorDescription: string;
    errorCode: string;
  };

  data: T;

  constructor(body: T) {
    this.data = body;
  }
}

export class ErrorResponse extends BaseResponse<undefined> {
  constructor(code: string, description: string) {
    super(undefined);
    this.error = {
      errorCode: code,
      errorDescription: description
    };
  }
}

export class BadRequestErrorResponse extends ErrorResponse {
  constructor(description: string) {
    super("400", description);
  }
}

export class EmptyResponse extends BaseResponse<undefined> { }