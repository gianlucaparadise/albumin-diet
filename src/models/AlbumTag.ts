import mongoose from 'mongoose';
import { model, Document, Schema, Model } from 'mongoose';
import { IAlbumDocument } from './Album';
import { ITagDocument } from './Tag';
import { User } from './User';
import logger from '../util/logger';
import { IAlbumTag } from './interfaces/IAlbumTag';

export interface IAlbumTagDocument extends IAlbumTag, Document {
  /**
   * Removes this albumTag if it is not linked to any user
   * @returns true if it has been deleted, false otherwise
   */
  removeIfOrphan(): Promise<boolean>;
}

export interface IAlbumTagModel extends Model<IAlbumTagDocument> {
  /**
   * Returns an AlbumTag with the input tag linked to the input album,
   * or creates one if missing
   * @param album Tagged album
   * @param tag Tag for the album
   */
  findOrCreate(album: IAlbumDocument, tag: ITagDocument): Promise<IAlbumTagDocument>;
}

const albumTagSchema = new Schema({
  album: { type: Schema.Types.ObjectId, ref: 'Album' },
  tag: { type: Schema.Types.ObjectId, ref: 'Tag' },
}, { timestamps: true });

albumTagSchema.methods.removeIfOrphan = async function (): Promise<boolean> {
  try {
    const albumTag = <IAlbumTagDocument>this;

    // Checking if there is still a user that has this albumTag in his list
    const isAlbumTagLinked = await User.exists({ 'albumTags': albumTag._id });
    logger.debug(`is albumTag orphan: ${!isAlbumTagLinked}`);

    if (isAlbumTagLinked) {
      return Promise.resolve(false);
    }

    // this AlbumTag is now orphan: I can delete it
    const deleteResult = await albumTag.remove();
    return Promise.resolve(true);

  } catch (error) {
    return Promise.reject(error);
  }
};

albumTagSchema.statics.findOrCreate = async function (album: IAlbumDocument, tag: ITagDocument): Promise<IAlbumTagDocument> {
  try {
    const albumTag = await AlbumTag.findOne({ album: album._id, tag: tag._id });

    if (albumTag) {
      logger.debug(`AlbumTag found: ${album.publicId.spotify} ${tag.uniqueId}`);
      return Promise.resolve(albumTag);
    }

    logger.debug(`AlbumTag creation: ${album.publicId.spotify} ${tag.uniqueId}`);
    const newAlbumTag = new AlbumTag();
    newAlbumTag.album = album;
    newAlbumTag.tag = tag;
    const savedAlbumTag = await newAlbumTag.save();

    return Promise.resolve(savedAlbumTag);

  } catch (error) {
    logger.error(error);
    return Promise.reject(error);
  }
};

export const AlbumTag: IAlbumTagModel = model<IAlbumTagDocument, IAlbumTagModel>('AlbumTag', albumTagSchema);
