import { IAlbum } from '../interfaces/IAlbum';
import { ITag } from '../interfaces/ITag';
import { BaseResponse, BasePaginationRequest } from './GenericResponses';
import { AlbumObjectFull } from 'spotify-web-api-node-typings';
import { IUser } from '../interfaces/IUser';
export declare class GetMyAlbumsRequest extends BasePaginationRequest {
    tags?: string;
    untagged?: string;
}
export declare class TagsByAlbum {
    [spotifyAlbumId: string]: {
        album: IAlbum;
        tags: ITag[];
    };
}
export declare class UserAlbum {
    album: AlbumObjectFull;
    isInListeningList: boolean;
}
export declare class TaggedAlbum extends UserAlbum {
    tags: ITag[];
    isSavedAlbum: boolean;
}
export declare class GetMyAlbumsResponse extends BaseResponse<TaggedAlbum[]> {
    static createFromSpotifyAlbums(spotifyAlbums: AlbumObjectFull[], tagsByAlbum: TagsByAlbum, tagFilter: string[], untagged: boolean, user: IUser): GetMyAlbumsResponse;
}
export declare class UserAlbumsResponse extends BaseResponse<UserAlbum[]> {
    static createFromSpotifyAlbums(spotifyAlbums: AlbumObjectFull[], listeningList: boolean | string[]): UserAlbumsResponse;
}
export declare class GetAlbumResponse extends BaseResponse<TaggedAlbum> {
    static createFromSpotifyAlbum(album: AlbumObjectFull, tags: ITag[], isSavedAlbum: boolean, user: IUser): GetAlbumResponse;
}
