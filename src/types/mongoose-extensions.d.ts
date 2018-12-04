declare module "mongoose" { // same name than in the import!
  export interface Model<T extends Document, QueryHelpers = {}> extends NodeJS.EventEmitter, ModelProperties {
    exists: (options: any) => Promise<boolean>;
  }
}