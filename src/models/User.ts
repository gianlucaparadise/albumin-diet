import { Document, Schema, Model, model, Types } from "mongoose";
import { IAlbumTag } from "./AlbumTag";
import { TagsByAlbum } from "./responses/GetMyAlbums";
import { BadRequestErrorResponse } from "./responses/GenericResponses";
import { ITag } from "./Tag";

export interface IUser extends Document {
  spotify: {
    id: String,
    accessToken: String,
    refreshToken: String,
  };
  displayName: string;
  albumTags: Types.Array<IAlbumTag>;
  /**
   * Pushes the input album tag in this user's albumTags list
   * @param albumTag AlbumTag to add
   */
  addAlbumTag(albumTag: IAlbumTag): Promise<boolean>;
  /**
   * Pulls the input album tag from this user's albumTags list
   * @param albumTag AlbumTag to remove
   */
  removeAlbumTag(albumTag: IAlbumTag): Promise<IUser>;
  /**
   * Starting from this user's albumTag list, builds a map of all
   * this user's tags grouped by spotify album id
   */
  getTagsByAlbum(): Promise<TagsByAlbum>;
  /**
   * Retrieves the list of the tags added by this user
   */
  getTags(): Promise<ITag[]>;
}

export interface IUserModel extends Model<IUser> {
  /**
   * Creates a new user, if missing, or updates found user with the new tokens.
   * The user is searched by spotify id.
   * @param profile Spotify profile to insert
   * @param accessToken User's access token
   * @param refreshToken User's refresh token
   */
  upsertSpotifyUser(profile: SpotifyApi.UserProfileAuthenticationNodeResponse, accessToken: string, refreshToken: string): Promise<IUser>;
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

    const countBeforeAdd = thisUser.albumTags.length;
    const added = thisUser.albumTags.addToSet(albumTag._id);
    const countAfterAdd = thisUser.albumTags.length;

    if (countAfterAdd === countBeforeAdd) {
      throw new BadRequestErrorResponse("Input tag already is one of the current user's tags");
    }

    const savedUser = await thisUser.save();
    return Promise.resolve(savedUser);
  }
  catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

userSchema.methods.removeAlbumTag = async function (albumTag: IAlbumTag): Promise<IUser> {
  try {
    const user = <IUser>this;

    const countBeforePull = user.albumTags.length;
    const pulledId = user.albumTags.pull(albumTag._id);
    const countAfterPull = user.albumTags.length;

    if (countBeforePull === countAfterPull) {
      throw new BadRequestErrorResponse("Input tag is not one of the current user's tags");
    }

    const savedUser = await user.save();
    console.log(`AlbumTag deleted from user`);
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

userSchema.methods.getTags = async function (): Promise<ITag[]> {
  try {
    const thisUser = <IUser>this;
    await thisUser
      .populate({ path: "albumTags", populate: [{ path: "tag" }] })
      .execPopulate();

    const result = thisUser.albumTags.map(x => x.tag);
    return Promise.resolve(result);

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