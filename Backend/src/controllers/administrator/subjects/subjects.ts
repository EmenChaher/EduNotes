import { Request, Response } from 'express';
import { SuccessResponse } from '@core/ApiResponse';
import { ForbiddenError, NotFoundError } from '@core/ApiError';
import Subject, { ISubject } from '@database/models/Subject';
import expressAsyncHandler from 'express-async-handler';
import Level from '@database/models/Level';
import Unit from '@database/models/Unit';
import { IDiplomaTypes } from '@database/models/Diploma';
import SubjectGrading, { ISubjectGrading } from '@database/models/SubjectGrading';

export const createSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const {
    label,
    coefficient,
    lecture,
    guidedSession,
    practicalSession,
    supervisedAssessment1,
    supervisedAssessment2,
    practical,
    exam,
    other,
    level,
    unit,
  } = req.body;

  let currentLevel = level;
  if (level) {
    const levelExists = await Level.findOne({ _id: level });
    if (!levelExists) throw new ForbiddenError('Invalid level ID.');
    const levelDiplomaType: any = await levelExists.populate({
      path: 'studyField',
      populate: { path: 'diploma' },
    });

    if (
      levelDiplomaType &&
      levelDiplomaType.studyField &&
      levelDiplomaType.studyField.diploma &&
      levelDiplomaType.studyField.diploma.type &&
      levelDiplomaType.studyField.diploma.type !== IDiplomaTypes.Engineering
    ) {
      throw new ForbiddenError('Subject can only be added to a level when the parent diploma type is Engineering');
    }
  }

  if (unit) {
    const unitExists = await Unit.findOne({ _id: unit });
    if (!unitExists) throw new ForbiddenError('Invalid unit ID.');
    currentLevel = unitExists.level;
  }

  const subjectGrading: ISubjectGrading = await SubjectGrading.findOneOrCreate({
    supervisedAssessment1,
    supervisedAssessment2,
    practical,
    exam,
    other,
  });

  const newSubject: ISubject = new Subject({
    level: currentLevel,
    unit,
    coefficient,
    lecture,
    guidedSession,
    practicalSession,
    grading: subjectGrading._id,
    label,
  });

  await newSubject.save();

  await newSubject.populate([
    { path: 'grading' },
    { path: 'unit', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } },
    { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
  ]);
  new SuccessResponse('Subject has been successfully created.', { subject: newSubject }).send(res);
});

export const updateSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, coefficient, lecture, guidedSession, practicalSession, supervisedAssessment1, supervisedAssessment2, practical, exam, other } =
    req.body;

  const subject = await Subject.findById(id);
  if (!subject) {
    throw new NotFoundError('No subject found with that ID.');
  }

  const updateFields: Record<string, any> = {};

  if (label !== undefined) {
    updateFields.label = label;
  }
  if (coefficient !== undefined) {
    updateFields.coefficient = coefficient;
  }
  if (lecture !== undefined) {
    updateFields.lecture = lecture;
  }
  if (guidedSession !== undefined) {
    updateFields.guidedSession = guidedSession;
  }
  if (practicalSession !== undefined) {
    updateFields.practicalSession = practicalSession;
  }

  let subjectGrading: ISubjectGrading | null = null;
  if (
    supervisedAssessment1 !== undefined ||
    supervisedAssessment2 !== undefined ||
    exam !== undefined ||
    other !== undefined ||
    practical !== undefined
  ) {
    const gradingUpdateFields: Record<string, any> = {};

    if (supervisedAssessment1 !== undefined) {
      gradingUpdateFields.supervisedAssessment1 = supervisedAssessment1;
    }
    if (supervisedAssessment2 !== undefined) {
      gradingUpdateFields.supervisedAssessment2 = supervisedAssessment2;
    }
    if (practical !== undefined) {
      gradingUpdateFields.practical = practical;
    }
    if (exam !== undefined) {
      gradingUpdateFields.exam = exam;
    }
    if (other !== undefined) {
      gradingUpdateFields.other = other;
    }

    subjectGrading = await SubjectGrading.findOneOrCreate(gradingUpdateFields);
  }

  if (subjectGrading) updateFields.grading = subjectGrading._id;

  const updatedSubject = await Subject.findByIdAndUpdate(id, updateFields, { new: true });

  if (!updatedSubject) {
    throw new NotFoundError('No subject found with that ID.');
  }

  await updatedSubject.populate([
    { path: 'grading' },
    { path: 'unit', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } },
    { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
  ]);

  new SuccessResponse('Subject has been successfully updated.', { subject: updatedSubject }).send(res);
});

export const deleteSubject = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const subjectToDelete = await Subject.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  if (!subjectToDelete) throw new NotFoundError('No subject found with that ID.');

  new SuccessResponse('Subject has been successfully deleted.').send(res);
});

export const getClassSubjects = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const levelExists = await Level.findOne({ _id: id });
  if (!levelExists) throw new ForbiddenError('Invalid level ID.');

  const classSubjects = await Subject.find({ level: id, deletedAt: null })
    .sort({ level: 1, label: 1 })
    .populate([
      { path: 'grading' },
      { path: 'unit', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } },
      { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
    ]);

  new SuccessResponse('Subjects retrieved successfully.', classSubjects).send(res);
});

export const getAllSubjects = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  };

  const findAllQuery = Subject.find({ deletedAt: null })
    .sort({ unit: 1, level: 1, label: 1 })
    .populate([
      { path: 'grading' },
      { path: 'unit', populate: { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } } },
      { path: 'level', populate: { path: 'studyField', populate: { path: 'diploma' } } },
    ]);

  const paginatedSubjects = await Subject.paginate(findAllQuery, options);

  new SuccessResponse('Subjects retrieved successfully.', paginatedSubjects).send(res);
});
