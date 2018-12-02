class BaseResponse<T> {
  error?: {
    errorDescription: string;
    errorCode: string;
  };

  data?: T;
}

export class ErrorResponse extends BaseResponse<undefined> {
  constructor(code: string, description: string) {
    super();
    this.error = {
      errorCode: code,
      errorDescription: description
    };
  }
}

export class EmptyResponse extends BaseResponse<undefined> { }