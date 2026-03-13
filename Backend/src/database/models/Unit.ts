import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Subject from './Subject';

export const DOCUMENT_NAME = 'Unit';
export const COLLECTION_NAME = 'units';

export interface IUnit extends Document {
  label: string;
  level: Schema.Types.ObjectId | string;
  deletedAt: Date | null;
}

const UnitSchema = new Schema<IUnit>(
  {
    label: { type: String, required: true },
    level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
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

UnitSchema.pre('updateMany', async function (next) {
  const update: any = this.getUpdate();
  if (update) {
    const setUpdate = update['$set'];
    if (setUpdate && 'deletedAt' in setUpdate && setUpdate.deletedAt !== null) {
      const docsToUpdate = await this.model.find(this.getFilter());
      for (const doc of docsToUpdate) {
        await Subject.updateMany({ unit: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
      }
    }
  }
  next();
});

UnitSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    await Subject.updateMany({ unit: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

UnitSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Subject.updateMany({ unit: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

UnitSchema.plugin(mongoosePaginate);

const Unit = model<IUnit, PaginateModel<IUnit>>(DOCUMENT_NAME, UnitSchema, COLLECTION_NAME);
export default Unit;
