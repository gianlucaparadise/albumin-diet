import { Document, Schema, Model, model } from "mongoose";
import { AlbumTag } from "./AlbumTag";
import logger from "../util/logger";

export const ListeningListTagName = "Listening List";

export interface ITag extends Document {
  uniqueId: string;
  name: string;
  /**
   * Removes this tag if it is not linked to any albumTag
   * @returns true if it has been deleted, false otherwise
   */
  removeIfOrphan(): Promise<boolean>;
}

export interface ITagModel extends Model<ITag> {
  /**
   * This converts the tag name in a unique id using a certain set of rules
   * @param name Tag Name
   */
  calculateUniqueIdByName(name: string): string;

  findOrCreate(name: string): Promise<ITag>;
}

export const tagSchema = new Schema({
  uniqueId: { type: String, unique: true },
  name: String,
}, { timestamps: true });

tagSchema.methods.removeIfOrphan = async function (): Promise<boolean> {
  try {
    const tag = <ITag>this;

    // Checking if there is still an albumTag that has this tag
    const isTagLinked = await AlbumTag.exists({ "tag": tag._id });
    logger.debug(`is tag orphan: ${!isTagLinked}`);

    if (isTagLinked) {
      return Promise.resolve(false);
    }

    // this Album is now orphan: I can delete it
    const deleteResult = await tag.remove();
    return Promise.resolve(true);

  } catch (error) {
    return Promise.reject(error);
  }
};

tagSchema.statics.calculateUniqueIdByName = function (name: String): String {
  const uniqueId = name
    .replace(/[\s_,'`]+/g, "-") // replace all unwanted chars with dashes
    .replace(/-+/g, "-") // this removes consequent dashes
    .trim() // todo: I should trim dashes
    .toLowerCase();

  // todo: understand which chars should be replaced with dashes (eg. \s_,'`)

  return uniqueId;
};

tagSchema.statics.findOrCreate = async function (name: string): Promise<ITag> {
  try {
    const uniqueId = Tag.calculateUniqueIdByName(name);
    const tag = await Tag.findOne({ uniqueId: uniqueId });

    if (tag) {
      logger.debug(`Tag found: ${uniqueId}`);
      return Promise.resolve(tag);
    }

    logger.debug(`Tag creation: ${uniqueId}`);
    // I create a tag
    const newTag = new Tag();
    newTag.uniqueId = uniqueId;
    newTag.name = name.trim();

    const savedTag = await newTag.save();

    return Promise.resolve(savedTag);
  }
  catch (error) {
    return Promise.reject(error);
  }
};

export const Tag = model<ITag, ITagModel>("Tag", tagSchema);