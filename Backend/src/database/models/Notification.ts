import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const DOCUMENT_NAME = 'Notification';
export const COLLECTION_NAME = 'notifications';

export interface INotification extends Document {
  source: Schema.Types.ObjectId | string;
  target: Schema.Types.ObjectId | string;
  message: string;
  read: boolean;
  path?: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    source: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    path: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

NotificationSchema.plugin(mongoosePaginate);

const Notification = model<INotification, PaginateModel<INotification>>(DOCUMENT_NAME, NotificationSchema, COLLECTION_NAME);
export default Notification;
