export declare class AlbumRequest {
    album: {
        spotifyId: string;
    };
    static checkConsistency(bodyAny: any): AlbumRequest;
}
