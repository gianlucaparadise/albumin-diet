import { Document, Schema, Model, model, Types } from "mongoose";
import { IAlbumTag } from "./AlbumTag";
import { TagsByAlbum } from "./responses/TaggedAlbum";

export interface IUser extends Document {
  spotify: {
    id: String,
    accessToken: String,
    refreshToken: String,
  };
  displayName: string;
  albumTags: Types.Array<IAlbumTag>;
  addAlbumTag(albumTag: IAlbumTag): Promise<boolean>;
  /**
   * Retrieves user's tags indexed by album spotifyId
   */
  getTagsByAlbum(): Promise<TagsByAlbum>;
}

export interface IUserModel extends Model<IUser> {
  upsertSpotifyUser(profile: any, accessToken: string, refreshToken: string): Promise<IUser>;
}

export const userSchema: Schema = new Schema({
  spotify: {
    id: String,
    accessToken: String,
    refreshToken: String,
  },
  displayName: String,
  albumTags: [{ type: Schema.Types.ObjectId, ref: "AlbumTag" }],
}, { timestamps: true });

userSchema.methods.addAlbumTag = async function (albumTag: IAlbumTag): Promise<IUser> {
  try {
    const thisUser = <IUser>this;

    const added: any = thisUser.albumTags.addToSet(albumTag._id);
    console.log(`albumTag ${added ? "added" : "not added"} to user`);

    const savedUser = await thisUser.save();
    return Promise.resolve(savedUser);
  }
  catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

userSchema.methods.getTagsByAlbum = async function (): Promise<TagsByAlbum> {
  try {
    const thisUser = <IUser>this;
    await thisUser.
      populate({ path: "albumTags", populate: [{ path: "tag", select: "uniqueId name" }, { path: "album" }] })
      .execPopulate();

    // Grouping albums by spotifyId
    const taggedAlbums: TagsByAlbum = thisUser.albumTags.reduce((taggedAlbumsMap, albumTag) => {
      const spotifyId = albumTag.album.publicId.spotify;

      if (!taggedAlbumsMap[spotifyId]) {
        taggedAlbumsMap[spotifyId] = {
          album: albumTag.album,
          tags: []
        };
      }

      taggedAlbumsMap[spotifyId].tags.push(albumTag.tag);
      return taggedAlbumsMap;
    }, new TagsByAlbum());

    return taggedAlbums;

  } catch (error) {
    return Promise.reject(error);
  }
};

userSchema.statics.upsertSpotifyUser = async function (profile: SpotifyApi.UserProfileAuthenticationNodeResponse, accessToken: string, refreshToken: string): Promise<IUser> {
  try {
    const user = await User.findOne({
      "spotify.id": profile.id
    });

    if (user) {
      user.spotify = Object.assign(user.spotify, { accessToken: accessToken, refreshToken: refreshToken });
      user.displayName = profile.displayName;
      const savedUser = await user.save();
      return Promise.resolve(savedUser);
    }

    // no user was found: we create a new one
    const newUser = new User();
    // todo: encrypt tokens
    newUser.spotify = {
      id: profile.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    newUser.displayName = profile.displayName;

    const savedUser = await newUser.save();
    return Promise.resolve(savedUser);
  }
  catch (error) {
    return Promise.reject(error);
  }
};

export const User: IUserModel = model<IUser, IUserModel>("User", userSchema);