import mongoose from "mongoose";
import { model, Document, Schema, Model } from "mongoose";
import { IAlbum } from "./Album";
import { ITag } from "./Tag";

export interface IAlbumTag extends Document {
  album: IAlbum;
  tag: ITag;
}

export interface IAlbumTagModel extends Model<IAlbumTag> {
  findOrCreate(album: IAlbum, tag: ITag): Promise<IAlbumTag>;
}

const albumTagSchema = new Schema({
  album: { type: Schema.Types.ObjectId, ref: "Album" },
  tag: { type: Schema.Types.ObjectId, ref: "Tag" },
}, { timestamps: true });

albumTagSchema.statics.findOrCreate = async function (album: IAlbum, tag: ITag): Promise<IAlbumTag> {
  try {
    const albumTag = await AlbumTag.findOne({ album: album._id, tag: tag._id });

    if (albumTag) {
      console.log("AlbumTag found");
      return Promise.resolve(albumTag);
    }

    console.log("AlbumTag creation");
    const newAlbumTag = new AlbumTag();
    newAlbumTag.album = album;
    newAlbumTag.tag = tag;
    const savedAlbumTag = await newAlbumTag.save();

    return Promise.resolve(savedAlbumTag);

  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

export const AlbumTag: IAlbumTagModel = model<IAlbumTag, IAlbumTagModel>("AlbumTag", albumTagSchema);