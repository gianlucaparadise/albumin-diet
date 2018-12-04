import { Document, Schema, Model, model } from "mongoose";
import { AlbumTag } from "./AlbumTag";

export interface IAlbum extends Document {
  // name: string;
  publicId: {
    spotify: string
  };
  // url: {
  //   spotify: string
  // };
  // cover: {
  //   spotify: string
  // };
  // info: {
  //   releaseYear: string
  // };
  // artist: {
  //   name: string
  // };
  /**
   * Removes this album if it is not linked to any albumTag
   * @returns true if it has been deleted, false otherwise
   */
  removeIfOrphan(): Promise<boolean>;
}

export interface IAlbumModel extends Model<IAlbum> {
  findOrCreate(id: string): Promise<IAlbum>;
}

export const albumSchema = new Schema({
  // name: String,
  publicId: {
    spotify: String
  },
  // url: {
  //   spotify: String
  // },
  // cover: {
  //   spotify: String
  // },
  // info: {
  //   releaseYear: String
  // },
  // artist: {
  //   name: String
  // }
}, { timestamps: true });

albumSchema.methods.removeIfOrphan = async function (): Promise<boolean> {
  try {
    const album = <IAlbum>this;

    // Checking if there is still an AlbumTag that links this album
    const isAlbumLinked = await AlbumTag.exists({ "album": album._id });
    console.log(`is album orphan: ${!isAlbumLinked}`);

    if (isAlbumLinked) {
      return Promise.resolve(false);
    }

    // this Album is now orphan: I can delete it
    const deleteResult = await album.remove();
    return Promise.resolve(true);

  } catch (error) {
    return Promise.reject(error);
  }
};

albumSchema.statics.findOrCreate = async function (id: string): Promise<IAlbum> {
  try {
    const album = await Album.findOne({ "publicId.spotify": id });
    if (album) {
      console.log("Album found");
      return Promise.resolve(album);
    }

    console.log("Album creation");
    const newAlbum = new Album();
    newAlbum.publicId = { spotify: id };
    const savedAlbum = await newAlbum.save();

    return Promise.resolve(savedAlbum);
  }
  catch (error) {
    return Promise.reject(error);
  }
};

export const Album = model<IAlbum, IAlbumModel>("Album", albumSchema);