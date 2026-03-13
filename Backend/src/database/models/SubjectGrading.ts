import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const DOCUMENT_NAME = 'SubjectGrading';
export const COLLECTION_NAME = 'subject_grading';

export enum SubjectContent {
  supervisedAssessment1 = 'supervisedAssessment1',
  supervisedAssessment2 = 'supervisedAssessment2',
  practical = 'practical',
  exam = 'exam',
  other = 'other',
}
interface SubjectTypeDictionary {
  [key: string]: string;
}

export const subjectContentDictionary: SubjectTypeDictionary = {
  [SubjectContent.supervisedAssessment1]: 'DS1',
  [SubjectContent.supervisedAssessment2]: 'DS2',
  [SubjectContent.practical]: 'Examen TP',
  [SubjectContent.exam]: 'Examen',
  [SubjectContent.other]: 'Autre note',
};

export interface ISubjectGrading extends Document {
  supervisedAssessment1: number;
  supervisedAssessment2: number;
  practical: number;
  exam: number;
  other: number;
  deletedAt: Date | null;
}

export interface ISubjectGradingModel extends PaginateModel<ISubjectGrading> {
  findOneOrCreate(condition: Record<string, string>): Promise<ISubjectGrading>;
}

const SubjectGradingSchema = new Schema<ISubjectGrading>(
  {
    supervisedAssessment1: { type: Number },
    supervisedAssessment2: { type: Number },
    practical: { type: Number },
    exam: { type: Number },
    other: { type: Number },
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

SubjectGradingSchema.pre<ISubjectGrading>('save', function (next) {
  if (!this.supervisedAssessment1 && !this.supervisedAssessment2 && !this.exam && !this.other) {
    next(new Error('Either unit or level must be specified.'));
  } else {
    next();
  }
});

SubjectGradingSchema.statics.findOneOrCreate = async function (condition: Record<string, string>): Promise<ISubjectGrading> {
  try {
    let result = await this.findOne(condition).exec();
    if (result) {
      return result;
    }

    result = await this.create(condition);
    return result;
  } catch (error) {
    throw new Error(`Error in findOneOrCreate: ${error}`);
  }
};

SubjectGradingSchema.plugin(mongoosePaginate);

const SubjectGrading = model<ISubjectGrading, ISubjectGradingModel>(DOCUMENT_NAME, SubjectGradingSchema, COLLECTION_NAME);
export default SubjectGrading;
