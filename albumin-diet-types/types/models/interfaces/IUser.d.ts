import { IAlbumTag } from "./IAlbumTag";
export interface IUser {
    spotify: {
        id: String;
        accessToken: String;
        refreshToken: String;
    };
    displayName: string;
    albumTags: IAlbumTag[];
    listeningList: string[];
}
