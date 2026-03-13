import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IGradeReport } from './GradeReport';

export const DOCUMENT_NAME = 'Grade';
export const COLLECTION_NAME = 'grades';

export interface IGrade extends Document {
  value: number | 'ABS' | 'DISP';
  student: string;
  report: IGradeReport | string;
  deletedAt: Date | null;
}

const GradeSchema = new Schema<IGrade>(
  {
    report: { type: Schema.Types.ObjectId, ref: 'GradeReport', required: true },
    student: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return v.length === 8;
        },
        message: (props) => `${props.value} must be exactly 8 characters!`,
      },
    },
    value: { type: Schema.Types.Mixed, required: true },
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

GradeSchema.pre<IGrade>('save', async function (next) {
  const existingGrade = await Grade.findOne({ gradeReport: this.report, student: this.student, deletedAt: null });

  if (existingGrade) {
    const err = new Error('Cannot insert duplicate grades in the same report for the same student.');
    next(err);
  } else {
    next();
  }
});

GradeSchema.plugin(mongoosePaginate);

const Grade = model<IGrade, PaginateModel<IGrade>>(DOCUMENT_NAME, GradeSchema, COLLECTION_NAME);
export default Grade;
