import { Model } from 'mongoose';

Model.exists = async function (options: any): Promise<boolean> {
  const result = await this.findOne(options).select('_id').lean();
  return result ? true : false;
};
