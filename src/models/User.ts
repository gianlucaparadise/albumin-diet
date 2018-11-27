import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
  /**
   * Spotify username
   */
  spotify: string;
  displayName: string;
  // comparePassword(password: string): boolean;
}

export interface IUserModel extends Model<IUser> {
  findOrCreate(profile: any): Promise<IUser>;
}

export const userSchema: Schema = new Schema({
  /**
   * Spotify username
   */
  spotify: String,
  displayName: String
}, { timestamps: true });

// userSchema.method("comparePassword", function (password: string): boolean {
//   // if (bcrypt.compareSync(password, this.password)) return true;
//   return false;
// });

userSchema.static("findOrCreate", async function (profile: any): Promise<IUser> {
  try {
    const found: IUser = await User.findOne({ spotify: profile.id });
    if (found) {
      return Promise.resolve(found);
    }

    const newUser: IUser = new User();
    newUser.spotify = profile.id;
    newUser.displayName = profile.displayName;
    const createdUser: IUser = await newUser.save();
    return Promise.resolve(createdUser);

  } catch (error) {
    return Promise.reject(error);
  }
});

export const User: IUserModel = model<IUser, IUserModel>("User", userSchema);

export default User;