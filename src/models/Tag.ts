import { Document, Schema, Model, model } from "mongoose";
import { AlbumTag } from "./AlbumTag";

export interface ITag extends Document {
  // todo: check how to customize the setter and normalize the inserted id using a naming convention
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
    console.log(`is tag orphan: ${!isTagLinked}`);

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
    .trim()
    .replace(" ", "-")
    .toLowerCase();

  return uniqueId;
};

tagSchema.statics.findOrCreate = async function (name: string): Promise<ITag> {
  try {
    const uniqueId = Tag.calculateUniqueIdByName(name);
    const tag = await Tag.findOne({ uniqueId: uniqueId });

    if (tag) {
      console.log("Tag found");
      return Promise.resolve(tag);
    }

    console.log("Tag creation");
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