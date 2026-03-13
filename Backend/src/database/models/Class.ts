import { model, Schema, Document, PaginateModel, AggregatePaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import Teaching from './Teaching';

export const DOCUMENT_NAME = 'Class';
export const COLLECTION_NAME = 'classes';

export interface IClass extends Document {
  label: number;
  level: Schema.Types.ObjectId | string;
  deletedAt: Date | null;
}

const ClassSchema = new Schema<IClass>(
  {
    label: { type: Number, default: 0 },
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

export const findHighestLabel = async function (level: Schema.Types.ObjectId | string) {
  const highestClass = await Class.findOne({ level, deletedAt: null }).sort({ label: -1 }).select('label');
  return highestClass ? highestClass.label : 0;
};

ClassSchema.pre<IClass>('save', async function (next) {
  if (!this.isNew) return next();
  const highestLabel = await findHighestLabel(this.level);
  this.label = highestLabel + 1;
  return next();
});

ClassSchema.pre('updateMany', async function (next) {
  const update: any = this.getUpdate();
  if (update) {
    const setUpdate = update['$set'];
    if (setUpdate && 'deletedAt' in setUpdate && setUpdate.deletedAt !== null) {
      const docsToUpdate = await this.model.find(this.getFilter());
      for (const doc of docsToUpdate) {
        await Teaching.updateMany({ class: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
      }
    }
  }
  next();
});

ClassSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    const classesToUpdate = await this.model.find({ level: doc.level, deletedAt: null, label: { $gt: doc.label } });
    for (const classToUpdate of classesToUpdate) {
      classToUpdate.label -= 1;
      await classToUpdate.save();
    }
    await Teaching.updateMany({ class: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

ClassSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Teaching.updateMany({ class: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

ClassSchema.plugin(mongoosePaginate);
ClassSchema.plugin(aggregatePaginate);

const Class = model<IClass, PaginateModel<IClass>>(DOCUMENT_NAME, ClassSchema, COLLECTION_NAME);
export const ClassAggregation = model<IClass, AggregatePaginateModel<IClass>>(DOCUMENT_NAME, ClassSchema, COLLECTION_NAME);
export default Class;
