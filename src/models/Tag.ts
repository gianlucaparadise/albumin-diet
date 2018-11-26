import mongoose from "mongoose";

export type TagModel = mongoose.Document & {
  // todo: check how to customize the setter and normalize the inserted id using a naming convention
  id: string,
  name: string
};

const tagSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String
}, { timestamps: true });

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;