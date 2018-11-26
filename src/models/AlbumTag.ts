import mongoose from "mongoose";
import { AlbumModel } from "./Album";
import { TagModel } from "./Tag";

export type AlbumTagModel = mongoose.Document & {
  album: AlbumModel,
  tag: TagModel
};

const albumTagSchema = new mongoose.Schema({
  album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
  tag: { type: mongoose.Schema.Types.ObjectId, ref: "Tag" },
}, { timestamps: true });

const AlbumTag = mongoose.model("AlbumTag", albumTagSchema);
export default AlbumTag;
