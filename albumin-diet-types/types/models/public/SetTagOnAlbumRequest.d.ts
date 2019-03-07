import { AlbumRequest } from "./AlbumRequest";
export declare class TagOnAlbumRequest extends AlbumRequest {
    tag: {
        name: string;
    };
    static checkConsistency(bodyAny: any): TagOnAlbumRequest;
}
