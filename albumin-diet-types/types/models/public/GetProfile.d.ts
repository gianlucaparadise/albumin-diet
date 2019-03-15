import { BaseResponse } from './GenericResponses';
import { UserObjectPrivate } from 'spotify-web-api-node-typings';
export declare class GetProfileResponse extends BaseResponse<UserObjectPrivate> {
}
export declare class SendTokenResponse {
    auth: string;
    token: string;
}
