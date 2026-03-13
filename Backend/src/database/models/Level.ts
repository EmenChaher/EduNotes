import { model, Schema, Document, PaginateModel, Query } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Class from './Class';
import Unit from './Unit';
import Subject from './Subject';

export const DOCUMENT_NAME = 'Level';
export const COLLECTION_NAME = 'levels';

export interface ILevel extends Document {
  label: number;
  studyField: Schema.Types.ObjectId | string;
  deletedAt: Date | null;
}

const LevelSchema = new Schema<ILevel>(
  {
    label: { type: Number, default: 0 },
    studyField: { type: Schema.Types.ObjectId, ref: 'StudyField', required: true },
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

export const findHighestLabel = async function (studyField: Schema.Types.ObjectId | string) {
  const level = await Level.findOne({ studyField, deletedAt: null }).sort({ label: -1 }).select('label');
  return level ? level.label : 0;
};

LevelSchema.pre<ILevel>('save', async function (next) {
  if (!this.isNew) return next();
  const highestLabel = await findHighestLabel(this.studyField);
  this.label = highestLabel + 1;
  return next();
});

LevelSchema.pre('updateMany', async function (next) {
  const update: any = this.getUpdate();
  if (update) {
    const setUpdate = update['$set'];
    if (setUpdate && 'deletedAt' in setUpdate && setUpdate.deletedAt !== null) {
      const docsToUpdate = await this.model.find(this.getFilter());
      for (const doc of docsToUpdate) {
        await Class.updateMany({ level: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
        await Unit.updateMany({ level: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
        await Subject.updateMany({ level: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
      }
    }
  }
  next();
});

LevelSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    const levelsToUpdate = await this.model.find({ studyField: doc.studyField, deletedAt: null, label: { $gt: doc.label } });
    for (const level of levelsToUpdate) {
      level.label -= 1;
      await level.save();
    }
    await Class.updateMany({ level: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
    await Unit.updateMany({ level: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
    await Subject.updateMany({ level: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

LevelSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Class.updateMany({ level: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
    await Unit.updateMany({ level: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
    await Subject.updateMany({ level: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

LevelSchema.plugin(mongoosePaginate);

const Level = model<ILevel, PaginateModel<ILevel>>(DOCUMENT_NAME, LevelSchema, COLLECTION_NAME);
export default Level;
