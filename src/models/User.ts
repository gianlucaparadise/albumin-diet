import mongoose from "mongoose";

export type UserModel = mongoose.Document & {
  email: string,
  username: {
    spotify: string,
  }
};

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  username: {
    spotify: String,
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
