export declare class BasePaginationRequest {
    limit?: string;
    offset?: string;
}
export declare class BaseResponse<T> {
    error?: {
        errorDescription: string;
        errorCode: string;
        statusCode: number;
    };
    data: T;
    constructor(body: T);
}
export declare class ErrorResponse extends BaseResponse<undefined> {
    constructor(code: string, description: string, statusCode?: number);
}
export declare class BadRequestErrorResponse extends ErrorResponse {
    constructor(description: string);
}
export declare class EmptyResponse extends BaseResponse<undefined> {
    constructor();
}
