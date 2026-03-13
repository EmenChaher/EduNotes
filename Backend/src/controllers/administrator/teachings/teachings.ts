import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Subject, { ISubject } from '@database/models/Subject';
import expressAsyncHandler from 'express-async-handler';
import User, { UserTypes } from '@database/models/User';
import Class from '@database/models/Class';
import Teaching, { ITeaching, TeachingType } from '@database/models/Teaching';

export const createTeaching = expressAsyncHandler(async (req: Request, res: Response) => {
  const { teacher, class: classId, subject, type } = req.body;

  const teacherExists = await User.findOne({ _id: teacher });
  if (!teacherExists) throw new NotFoundError('Invalid teacher ID.');
  if (teacherExists.type !== UserTypes.Teacher) throw new ForbiddenError('User is not a teacher.');

  const classExists = await Class.exists({ _id: classId });
  if (!classExists) throw new NotFoundError('Invalid class ID.');

  const subjectExists = await Subject.findOne({ _id: subject });
  if (!subjectExists) throw new NotFoundError('Invalid subject ID.');

  const teachingExists = await Teaching.findOne({ subject, class: classId, deletedAt: null });
  if (teachingExists) {
    if (teachingExists.type === type && teachingExists.teacher === teacher) throw new ForbiddenError('Teaching already exists.');
    if (teachingExists.type === type) throw new ForbiddenError('A teaching for this subject type already exists.');
  }

  if (
    (type === TeachingType.Lecture && !subjectExists.lecture) ||
    (type === TeachingType.GuidedSession && !subjectExists.guidedSession) ||
    (type === TeachingType.PracticalSession && !subjectExists.practicalSession)
  ) {
    throw new ForbiddenError('Invalid teaching type for the subject');
  }

  const newTeaching: ITeaching = new Teaching({
    teacher,
    class: classId,
    subject,
    type,
  });

  await newTeaching.save();

  await newTeaching.populate([
    { path: 'teacher', select: '_id name surname' },
    {
      path: 'class',
      select: '_id label level',
      populate: { path: 'level', select: '_id label studyField', populate: { path: 'studyField', select: '_id label acronym' } },
    },
    {
      path: 'subject',
      select: '_id label lecture guidedSession practicalSession',
    },
  ]);
  new SuccessResponse('Teaching has been successfully created.', { teaching: newTeaching }).send(res);
});

export const deleteTeaching = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const teachingToDelete = await Teaching.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!teachingToDelete) throw new NotFoundError('No teaching found with that ID.');

  new SuccessResponse('Teaching has been successfully deleted.').send(res);
});

export const updateTeaching = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { teacher, class: classId, subject, type } = req.body;

  const teachingToUpdate = await Teaching.findOne({ _id: id, deletedAt: null });
  if (!teachingToUpdate) throw new NotFoundError('No teaching found with that ID.');

  const updateFields: any = {};

  if (teacher !== undefined) {
    const teacherExists = await User.findOne({ _id: teacher });
    if (!teacherExists) throw new NotFoundError('Invalid teacher ID.');
    if (teacherExists.type !== UserTypes.Teacher) throw new ForbiddenError('User is not a teacher.');
    updateFields.teacher = teacher;
  }

  if (classId !== undefined) {
    const classExists = await Class.exists({ _id: classId });
    if (!classExists) throw new NotFoundError('Invalid class ID.');
    updateFields.class = classId;
  }

  if (subject !== undefined) {
    const subjectExists = await Subject.findOne({ _id: subject });
    if (!subjectExists) throw new NotFoundError('Invalid subject ID.');
    updateFields.subject = subject;
  }

  if (type !== undefined) {
    updateFields.type = type;
  }

  // Check for duplicate teaching if relevant fields are being updated
  if (subject !== undefined || classId !== undefined || type !== undefined) {
    const finalSubject = subject || teachingToUpdate.subject;
    const finalClass = classId || teachingToUpdate.class;
    const finalType = type || teachingToUpdate.type;

    const existingTeaching = await Teaching.findOne({
      subject: finalSubject,
      class: finalClass,
      type: finalType,
      deletedAt: null,
      _id: { $ne: id },
    });

    if (existingTeaching) {
      throw new ForbiddenError('A teaching for this subject type already exists.');
    }

    // Validate teaching type against subject capabilities
    if (subject !== undefined || type !== undefined) {
      const subjectToCheck = subject ? await Subject.findOne({ _id: subject }) : await Subject.findOne({ _id: teachingToUpdate.subject });
      const typeToCheck = type || teachingToUpdate.type;

      if (
        (typeToCheck === TeachingType.Lecture && !subjectToCheck!.lecture) ||
        (typeToCheck === TeachingType.GuidedSession && !subjectToCheck!.guidedSession) ||
        (typeToCheck === TeachingType.PracticalSession && !subjectToCheck!.practicalSession)
      ) {
        throw new ForbiddenError('Invalid teaching type for the subject');
      }
    }
  }

  const updatedTeaching = await Teaching.findByIdAndUpdate(id, updateFields, { new: true }).populate([
    { path: 'teacher', select: '_id name surname' },
    {
      path: 'class',
      select: '_id label level',
      populate: { path: 'level', select: '_id label studyField', populate: { path: 'studyField', select: '_id label acronym' } },
    },
    {
      path: 'subject',
      select: '_id label lecture guidedSession practicalSession',
    },
  ]);

  new SuccessResponse('Teaching has been successfully updated.', { teaching: updatedTeaching }).send(res);
});

export const getAllTeachings = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const findAllQuery = Teaching.find({ deletedAt: null })
    .sort({ createdAt: 1, class: 1, subject: 1 })
    .populate([
      { path: 'teacher', select: '_id name surname' },
      {
        path: 'class',
        select: '_id label level',
        populate: { path: 'level', select: '_id label studyField', populate: { path: 'studyField', select: '_id label acronym' } },
      },
      {
        path: 'subject',
        select: '_id label lecture guidedSession practicalSession',
      },
    ]);

  const paginatedTeaching = await Teaching.paginate(findAllQuery, options);

  new SuccessResponse('Teachings retrieved successfully.', paginatedTeaching).send(res);
});
