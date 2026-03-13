import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import User, { UserTypes } from './User';

export const DOCUMENT_NAME = 'Invitation';
export const COLLECTION_NAME = 'invitations';

export enum InvitationStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Expired = 'Expired',
}

export interface IInvitation extends Document {
  email: string;
  token: string;
  type: UserTypes;
  class: string;
  status: InvitationStatus;
}

const invitationSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: UserTypes, required: true },
    status: { type: String, enum: Object.values(InvitationStatus), default: InvitationStatus.Pending },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: function (this: IInvitation) {
        return this.type === UserTypes.Student;
      },
    },
  },
  {
    timestamps: true,
  },
);

invitationSchema.plugin(mongoosePaginate);

invitationSchema.pre('save', async function (this: IInvitation, next) {
  this.email = this.email?.toLowerCase();
  next();
});

const Invitation = model<IInvitation, PaginateModel<IInvitation>>(DOCUMENT_NAME, invitationSchema, COLLECTION_NAME);
export default Invitation;
