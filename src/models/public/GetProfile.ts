import { BaseResponse } from './GenericResponses';
import { UserObjectPrivate } from 'spotify-web-api-node-typings';

export class GetProfileResponse extends BaseResponse<UserObjectPrivate> {

}

export class SendTokenResponse {
  auth: string;
  token: string;
}
