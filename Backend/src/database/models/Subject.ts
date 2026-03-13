import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import Teaching from './Teaching';
import { ISubjectGrading } from './SubjectGrading';

export const DOCUMENT_NAME = 'Subject';
export const COLLECTION_NAME = 'subjects';

export interface ISubject extends Document {
  label: string;
  coefficient: number;
  lecture: boolean;
  guidedSession: boolean;
  practicalSession: boolean;
  grading: Schema.Types.ObjectId | ISubjectGrading | string;
  level: Schema.Types.ObjectId | string;
  unit: Schema.Types.ObjectId | string;
  deletedAt: Date | null;
}

const SubjectSchema = new Schema<ISubject>(
  {
    label: { type: String, required: true },
    coefficient: { type: Number, required: true },
    lecture: { type: Boolean, required: true },
    guidedSession: { type: Boolean, required: true },
    practicalSession: { type: Boolean, required: true },
    grading: { type: Schema.Types.ObjectId, ref: 'SubjectGrading', required: true },
    level: { type: Schema.Types.ObjectId, ref: 'Level' },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit' },
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

SubjectSchema.pre<ISubject>('save', function (next) {
  if (!this.unit && !this.level) {
    next(new Error('Either unit or level must be specified.'));
  } else {
    next();
  }
});

SubjectSchema.pre('updateMany', async function (next) {
  const update: any = this.getUpdate();
  if (update) {
    const setUpdate = update['$set'];
    if (setUpdate) {
      const docsToUpdate = await this.model.find(this.getFilter());
      if ('deletedAt' in setUpdate && setUpdate.deletedAt !== null) {
        for (const doc of docsToUpdate) {
          await Teaching.updateMany({ subject: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
        }
      }
      if ('lecture' in setUpdate && !setUpdate.lecture) {
        for (const doc of docsToUpdate) {
          await Teaching.updateMany({ subject: doc._id, type: 'lecture', deletedAt: null }, { $set: { deletedAt: new Date() } });
        }
      }
      if ('guidedSession' in setUpdate && !setUpdate.guidedSession) {
        for (const doc of docsToUpdate) {
          await Teaching.updateMany({ subject: doc._id, type: 'guidedSession', deletedAt: null }, { $set: { deletedAt: new Date() } });
        }
      }
      if ('practicalSession' in setUpdate && !setUpdate.practicalSession) {
        for (const doc of docsToUpdate) {
          await Teaching.updateMany({ subject: doc._id, type: 'practicalSession', deletedAt: null }, { $set: { deletedAt: new Date() } });
        }
      }
    }
  }
  next();
});

SubjectSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update) {
    const doc = await this.model.findOne(this.getQuery());
    if ('deletedAt' in update && update.deletedAt !== null) {
      await Teaching.updateMany({ subject: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
    }
    if ('lecture' in update && !update.lecture) {
      await Teaching.updateMany({ subject: doc._id, type: 'lecture', deletedAt: null }, { $set: { deletedAt: new Date() } });
    }
    if ('guidedSession' in update && !update.guidedSession) {
      await Teaching.updateMany({ subject: doc._id, type: 'guidedSession', deletedAt: null }, { $set: { deletedAt: new Date() } });
    }
    if ('practicalSession' in update && !update.practicalSession) {
      await Teaching.updateMany({ subject: doc._id, type: 'practicalSession', deletedAt: null }, { $set: { deletedAt: new Date() } });
    }
  }
});

SubjectSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Teaching.updateMany({ subject: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  if (this.isModified('lecture') && !this.lecture) {
    await Teaching.updateMany({ subject: this._id, type: 'lecture', deletedAt: null }, { $set: { deletedAt: new Date() } });
  }
  if (this.isModified('guidedSession') && !this.guidedSession) {
    await Teaching.updateMany({ subject: this._id, type: 'guidedSession', deletedAt: null }, { $set: { deletedAt: new Date() } });
  }
  if (this.isModified('practicalSession') && !this.practicalSession) {
    await Teaching.updateMany({ subject: this._id, type: 'practicalSession', deletedAt: null }, { $set: { deletedAt: new Date() } });
  }
  next();
});

SubjectSchema.plugin(mongoosePaginate);

const Subject = model<ISubject, PaginateModel<ISubject>>(DOCUMENT_NAME, SubjectSchema, COLLECTION_NAME);
export default Subject;
