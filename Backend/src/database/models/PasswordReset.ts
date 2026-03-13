import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { passwordResetExpiration } from '@config/envVar';
import ms from 'ms';

export const DOCUMENT_NAME = 'PasswordReset';
export const COLLECTION_NAME = 'password_reset_requests';

export enum PasswordResetStatus {
  Pending = 'Pending',
  Completed = 'Completed',
}

export interface IPasswordReset extends Document {
  email: string;
  token: string;
  status: PasswordResetStatus;
  expiresAt: Date;
  isRequestExpired(): Promise<boolean>;
}

const PasswordResetSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: PasswordResetStatus, default: PasswordResetStatus.Pending },
    expiresAt: { type: Date, default: () => new Date(Date.now() + ms(passwordResetExpiration)) },
  },
  {
    timestamps: true,
  },
);

PasswordResetSchema.methods.isRequestExpired = async function (this: IPasswordReset): Promise<boolean> {
  return new Date() > this.expiresAt;
};

PasswordResetSchema.plugin(mongoosePaginate);

const PasswordReset = model<IPasswordReset, PaginateModel<IPasswordReset>>(DOCUMENT_NAME, PasswordResetSchema, COLLECTION_NAME);
export default PasswordReset;
