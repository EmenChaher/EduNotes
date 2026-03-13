import { model, Schema, Document, PaginateModel, AggregatePaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { ISubject } from './Subject';
import { IUser } from './User';

export const DOCUMENT_NAME = 'Teaching';
export const COLLECTION_NAME = 'teaching';

export enum TeachingType {
  Lecture = 'lecture',
  GuidedSession = 'guidedSession',
  PracticalSession = 'practicalSession',
}

export interface ITeaching extends Document {
  teacher: IUser | string;
  class: Schema.Types.ObjectId | string;
  subject: Schema.Types.ObjectId | ISubject | string;
  type: TeachingType;
  deletedAt: Date | null;
}

const TeachingSchema: Schema<ITeaching> = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    type: { type: String, enum: Object.values(TeachingType), required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TeachingSchema.plugin(mongoosePaginate);
TeachingSchema.plugin(aggregatePaginate);

const Teaching = model<ITeaching, PaginateModel<ITeaching>>(DOCUMENT_NAME, TeachingSchema, COLLECTION_NAME);
export const TeachingAgreggation = model<ITeaching, AggregatePaginateModel<ITeaching>>(DOCUMENT_NAME, TeachingSchema, COLLECTION_NAME);
export default Teaching;
