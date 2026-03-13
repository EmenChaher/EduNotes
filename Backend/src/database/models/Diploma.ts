import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import StudyField from './StudyField';

export const DOCUMENT_NAME = 'Diploma';
export const COLLECTION_NAME = 'diplomas';

export enum IDiplomaTypes {
  LMD = 'LMD',
  Engineering = 'Ingénierie',
}

export interface IDiploma extends Document {
  label: string;
  type: IDiplomaTypes;
  deletedAt: Date;
}

const diplomaSchema: Schema = new Schema(
  {
    label: { type: String, required: true },
    type: { type: String, enum: IDiplomaTypes, required: true },
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

diplomaSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await StudyField.updateMany({ studyField: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

diplomaSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    await StudyField.updateMany({ diploma: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

diplomaSchema.plugin(mongoosePaginate);

const Diploma = model<IDiploma, PaginateModel<IDiploma>>(DOCUMENT_NAME, diplomaSchema, COLLECTION_NAME);
export default Diploma;
