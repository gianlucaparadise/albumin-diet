import { BaseResponse } from './GenericResponses';
import { ITag } from '../interfaces/ITag';
export declare class GetMyTagsResponse extends BaseResponse<ITag[]> {
    constructor(body: ITag[]);
}
