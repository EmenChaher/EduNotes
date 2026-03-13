import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Level from './Level';

export const DOCUMENT_NAME = 'StudyField';
export const COLLECTION_NAME = 'study_fields';

export interface IStudyField extends Document {
  label: string;
  acronym: string;
  diploma: string;
  deletedAt: Date;
}

const StudyFieldSchema: Schema = new Schema(
  {
    label: { type: String, required: true },
    acronym: { type: String, required: true },
    diploma: { type: Schema.Types.ObjectId, ref: 'Diploma', required: true },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

StudyFieldSchema.pre('updateMany', async function (next) {
  const update: any = this.getUpdate();
  if (update) {
    const setUpdate = update['$set'];
    if (setUpdate && 'deletedAt' in setUpdate && setUpdate.deletedAt !== null) {
      const docsToUpdate = await this.model.find(this.getFilter());
      for (const doc of docsToUpdate) {
        await Level.updateMany({ studyField: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
      }
    }
  }
  next();
});

StudyFieldSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Level.updateMany({ studyField: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

StudyFieldSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    await Level.updateMany({ studyField: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

StudyFieldSchema.plugin(mongoosePaginate);

const StudyField = model<IStudyField, PaginateModel<IStudyField>>(DOCUMENT_NAME, StudyFieldSchema, COLLECTION_NAME);
export default StudyField;
