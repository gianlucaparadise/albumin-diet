import { BaseResponse } from './GenericResponses';
import { ITag } from '../interfaces/ITag';
export declare class TagDescriptor {
    tag: ITag;
    count: number;
}
export declare class GetMyTagsResponse extends BaseResponse<TagDescriptor[]> {
    constructor(body: TagDescriptor[]);
}
