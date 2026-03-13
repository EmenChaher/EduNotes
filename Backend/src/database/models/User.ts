import { model, Schema, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import bcrypt from 'bcryptjs';
import Teaching from './Teaching';
import { IClass } from './Class';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export enum UserTypes {
  Student = 'Student',
  Teacher = 'Teacher',
  Admin = 'Admin',
  SuperAdmin = 'Super Admin',
}

export interface IUser extends Document {
  cin: string;
  name: string;
  surname: string;
  email: string;
  gender: string;
  phone: string;
  password: string;
  birthdate: string;
  region: string;
  type: UserTypes;
  class?: IClass | string;
  enrollmentYear?: string;
  studyStatus?: string;
  rank?: string;
  specialization?: string;
  jobStatus?: string;
  recruitmentYear?: string;
  mission?: string;
  deletedAt: Date | null;
  comparePassword(password: string): Promise<boolean>;
}

const staticFields = {
  cin: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  birthdate: { type: String, required: true },
  region: { type: String, required: true },
  deletedAt: { type: Date, select: true },
  type: {
    type: String,
    enum: UserTypes,
    required: true,
  },
};

function roleRequiredValidator(allowedRoles: UserTypes[]) {
  return function (this: IUser) {
    return allowedRoles.includes(this.type);
  };
}

const dynamicFields = {
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: roleRequiredValidator([UserTypes.Student]) },
  enrollmentYear: { type: String, required: roleRequiredValidator([UserTypes.Student]) },
  studyStatus: { type: String, required: roleRequiredValidator([UserTypes.Student]) },

  rank: { type: String, required: roleRequiredValidator([UserTypes.Teacher]) },
  specialization: { type: String, required: roleRequiredValidator([UserTypes.Teacher]) },

  jobStatus: { type: String, required: roleRequiredValidator([UserTypes.Admin, UserTypes.SuperAdmin]) },
  recruitmentYear: { type: String, required: roleRequiredValidator([UserTypes.Admin, UserTypes.SuperAdmin]) },

  mission: { type: String, required: roleRequiredValidator([UserTypes.SuperAdmin]) },
};

const UserSchema = new Schema(
  {
    ...staticFields,
    ...dynamicFields,
  },
  {
    timestamps: true,
  },
);

UserSchema.plugin(mongoosePaginate);

UserSchema.pre('updateMany', async function (next) {
  const update: any = this.getUpdate();
  if (update) {
    const setUpdate = update['$set'];
    if (setUpdate && 'deletedAt' in setUpdate && setUpdate.deletedAt !== null) {
      const docsToUpdate = await this.model.find(this.getFilter());
      for (const doc of docsToUpdate) {
        await Teaching.updateMany({ teacher: doc._id, deletedAt: null }, { $set: { deletedAt: setUpdate.deletedAt } });
      }
    }
  }
  next();
});

UserSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (update && 'deletedAt' in update && update.deletedAt !== null) {
    const doc = await this.model.findOne(this.getQuery());
    await Teaching.updateMany({ teacher: doc._id, deletedAt: null }, { $set: { deletedAt: update.deletedAt } });
  }
});

UserSchema.pre('save', async function (this: IUser, next) {
  this.email = this.email?.toLowerCase();
  this.password = await bcrypt.hash(this.password, 12);
  if (this.isModified('deletedAt') && this.deletedAt !== null) {
    await Teaching.updateMany({ teacher: this._id, deletedAt: null }, { $set: { deletedAt: this.deletedAt } });
  }
  next();
});

UserSchema.methods.comparePassword = async function (this: IUser, password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User = model<IUser, PaginateModel<IUser>>(DOCUMENT_NAME, UserSchema, COLLECTION_NAME);
export default User;
