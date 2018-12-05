import { BaseResponse } from "./GenericResponses";
import { ITag } from "../Tag";

export class GetMyTagsResponse extends BaseResponse<ITag[]> {
  constructor(body: ITag[]) {
    super(body);
  }
}