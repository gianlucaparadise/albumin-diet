import { Document, Schema, Model, model } from "mongoose";
import { IAlbumTag } from "./AlbumTag";

export interface IUser extends Document {
  /**
   * Spotify username
   */
  spotify: string;
  token: {
    spotify: string
  };
  displayName: string;

  albumTags: IAlbumTag[];

  addAlbumTag(albumTag: IAlbumTag): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  findOrCreateOrUpdateToken(profile: any, accessToken: string): Promise<IUser>;
}

export const userSchema: Schema = new Schema({
  /**
   * Spotify username
   */
  spotify: String,
  token: {
    spotify: String
  },
  displayName: String,
  albumTags: [{ type: Schema.Types.ObjectId, ref: "AlbumTag" }],
}, { timestamps: true });

userSchema.methods.addAlbumTag = async function (albumTag: IAlbumTag): Promise<IUser> {
  try {
    const thisUser = <IUser>this;

    const added: any = (<any>thisUser.albumTags).addToSet(albumTag._id);
    console.log(`Added ${added} albumTags to user`);

    const savedUser = await thisUser.save();
    return Promise.resolve(savedUser);
  }
  catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

userSchema.static("findOrCreateOrUpdateToken", async function (profile: any, accessToken: string): Promise<IUser> {
  try {
    const found: IUser = await User.findOne({ spotify: profile.id });
    if (found) {
      if (!found.token) {
        found.token = { spotify: accessToken };
      }
      else {
        found.token.spotify = accessToken;
      }
      const savedUser = await found.save();
      return Promise.resolve(savedUser);
    }

    const newUser: IUser = new User();
    newUser.spotify = profile.id;
    newUser.token = { spotify: accessToken };
    newUser.displayName = profile.displayName;
    const createdUser: IUser = await newUser.save();
    return Promise.resolve(createdUser);

  } catch (error) {
    return Promise.reject(error);
  }
});

export const User: IUserModel = model<IUser, IUserModel>("User", userSchema);
