import { BaseResponse } from './GenericResponses';
import { ITag } from '../interfaces/ITag';

export class TagDescriptor {
  tag: ITag;
  count: number;
}

export class GetMyTagsResponse extends BaseResponse<TagDescriptor[]> {
  constructor(body: TagDescriptor[]) {
    super(body);
  }
}
