import { Document, Schema, Model, model } from "mongoose";
import { AlbumTag } from "./AlbumTag";
import logger from "../util/logger";
import { IAlbum } from "./interfaces/IAlbum";

export interface IAlbumDocument extends IAlbum, Document {
  /**
   * Removes this album if it is not linked to any albumTag
   * @returns true if it has been deleted, false otherwise
   */
  removeIfOrphan(): Promise<boolean>;
}

export interface IAlbumModel extends Model<IAlbumDocument> {
  findOrCreate(id: string): Promise<IAlbumDocument>;
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
    const album = <IAlbumDocument>this;

    // Checking if there is still an AlbumTag that links this album
    const isAlbumLinked = await AlbumTag.exists({ "album": album._id });
    logger.debug(`is album orphan: ${!isAlbumLinked}`);

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

albumSchema.statics.findOrCreate = async function (id: string): Promise<IAlbumDocument> {
  try {
    const album = await Album.findOne({ "publicId.spotify": id });
    if (album) {
      logger.debug(`Album found: ${id}`);
      return Promise.resolve(album);
    }

    logger.debug(`Album creation: ${id}`);
    const newAlbum = new Album();
    newAlbum.publicId = { spotify: id };
    const savedAlbum = await newAlbum.save();

    return Promise.resolve(savedAlbum);
  }
  catch (error) {
    return Promise.reject(error);
  }
};

export const Album = model<IAlbumDocument, IAlbumModel>("Album", albumSchema);