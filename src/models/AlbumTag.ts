import { model, Document, Schema, Model, default as mongoose } from "mongoose";
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
}, { timestamps: true, usePushEach: true });

albumTagSchema.statics.findOrCreate = async (album: IAlbum, tag: ITag): Promise<IAlbumTag> => {
  try {
    // todo: update mongoose and use session
    // const session = await mongoose.startSession();

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

    // Now I save the tag in the album and the album in the tag
    console.log("Album and Tag update");

    album.tags.push(tag._id);
    await album.save();

    tag.albums.push(album._id);
    await tag.save();

    return Promise.resolve(savedAlbumTag);

  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

export const AlbumTag: IAlbumTagModel = model<IAlbumTag, IAlbumTagModel>("AlbumTag", albumTagSchema);