import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { SubjectContent } from './SubjectGrading';
import Grade from './Grade';
import { ITeaching } from './Teaching';

export const DOCUMENT_NAME = 'GradeReport';
export const COLLECTION_NAME = 'grade_reports';

export interface IGradeReport extends Document {
  teaching: ITeaching | string;
  type: SubjectContent;
  deletedAt: Date | null;
}

const GradeReportSchema = new Schema<IGradeReport>(
  {
    teaching: { type: Schema.Types.ObjectId, ref: 'Teaching', required: true },
    type: { type: String, required: true },
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

GradeReportSchema.pre('save', async function (next) {
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Grade.updateMany({ report: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

GradeReportSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    await Grade.updateMany({ report: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

GradeReportSchema.plugin(mongoosePaginate);

const GradeReport = model<IGradeReport, PaginateModel<IGradeReport>>(DOCUMENT_NAME, GradeReportSchema, COLLECTION_NAME);
export default GradeReport;