import { BaseResponse } from "./GenericResponses";
import { ITag } from "../interfaces/ITag";

export class GetMyTagsResponse extends BaseResponse<ITag[]> {
  constructor(body: ITag[]) {
    super(body);
  }
}