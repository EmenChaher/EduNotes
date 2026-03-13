import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ISubject } from "@src/models/subject"
import { createSubject, deleteSubject, fetchSubjectRelatedData, fetchSubjects, updateSubject } from "./thunk"
import { flattenPaginatedData, paginateData } from "@src/utils/paginations"
import { subjectsPerPage } from "@src/features/Administrator/Subjects"

interface SubjectState {
  subjects: { [page: number]: ISubject[] } | null
  total: number | null
  fetch: {
    status: string
    error: string | null
  }
  create: {
    status: string
    error: string | null
  }
  update: {
    status: string
    error: string | null
  }
  delete: {
    relatedData: { subjects: ISubject[] } | null
    status: string
    error: string | null
  }
}

const initialState: SubjectState = {
  subjects: null,
  total: null,
  fetch: {
    status: "idle",
    error: null,
  },
  create: {
    status: "idle",
    error: null,
  },
  update: {
    status: "idle",
    error: null,
  },
  delete: {
    relatedData: null,
    status: "idle",
    error: null,
  },
}

const subjectSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {
    removeUnit: (state, action: any) => {
      if (state.subjects) {
        if (state.subjects) {
          const unitId = action.payload
          const flattenedData = flattenPaginatedData(state.subjects)
          const unit = flattenedData.find((subject) => subject.unit && subject.unit._id === unitId)
          if (unit) {
            state.subjects = null
            state.total = null
          }
        }
      }
    },
    updateUnit: (state, action: PayloadAction<any>) => {
      if (state.subjects) {
        const { id, label } = action.payload
        const allSubjects = flattenPaginatedData<ISubject>(state.subjects!)
        const updatedSubjects = allSubjects.map((subject) => {
          if (subject.unit && subject.unit._id === id) {
            return {
              ...subject,
              unit: {
                ...subject.unit,
                label: label,
              },
            }
          }
          return subject
        })
        state.subjects = paginateData(updatedSubjects, subjectsPerPage)
      }
    },
    removeLevel: (state, action: any) => {
      if (state.subjects) {
        if (state.subjects) {
          const levelId = action.payload
          const flattenedData = flattenPaginatedData(state.subjects)
          const level = flattenedData.find((subject) => subject.level._id === levelId)
          if (level) {
            state.subjects = null
            state.total = null
          }
        }
      }
    },
    updateStudyField: (state, action: PayloadAction<any>) => {
      if (state.subjects) {
        const { id, label, diploma } = action.payload
        const allSubjects = flattenPaginatedData<ISubject>(state.subjects!)
        const updatedStudyFields = allSubjects.map((subject) => {
          if (subject.level.studyField._id === id) {
            return {
              ...subject,
              level: {
                ...subject.level,
                studyField: {
                  ...subject.level.studyField,
                  label,
                  diploma: diploma ? diploma : subject.level.studyField.diploma,
                },
              },
            }
          }
          return subject
        })
        state.subjects = paginateData(updatedStudyFields, subjectsPerPage)
      }
    },
    removeStudyField: (state, action: any) => {
      if (state.subjects) {
        if (state.subjects) {
          const studyFieldId = action.payload
          const flattenedData = flattenPaginatedData(state.subjects)
          const studyField = flattenedData.find((subject) => subject.level.studyField._id === studyFieldId)
          if (studyField) {
            state.subjects = null
            state.total = null
          }
        }
      }
    },
    updateDiploma: (state, action: PayloadAction<any>) => {
      if (state.subjects) {
        const { id, label } = action.payload
        const flattenedData = flattenPaginatedData<ISubject>(state.subjects!)
        const updatedStudyFields = flattenedData.map((subject) => {
          if (subject.level.studyField.diploma._id === id) {
            return {
              ...subject,
              level: {
                ...subject.level,
                studyField: {
                  ...subject.level.studyField,
                  diploma: {
                    ...subject.level.studyField.diploma,
                    label: label,
                  },
                },
              },
            }
          }
          return subject
        })
        state.subjects = paginateData(updatedStudyFields, subjectsPerPage)
      }
    },

    removeDiploma: (state, action: any) => {
      if (state.subjects) {
        const diplomaId = action.payload
        const flattenedData = flattenPaginatedData(state.subjects)
        const diploma = flattenedData.find((subject) => subject.level.studyField.diploma._id === diplomaId)
        if (diploma) {
          state.subjects = null
          state.total = null
        }
      }
    },
    restoreFetch: (state) => {
      state.fetch.error = null
      state.fetch.status = "idle"
    },
    restoreCreate: (state) => {
      state.create.error = null
      state.create.status = "idle"
    },
    restoreUpdate: (state) => {
      state.update.error = null
      state.update.status = "idle"
    },
    restoreDelete: (state) => {
      state.delete.relatedData = null
      state.delete.error = null
      state.delete.status = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.fetch.error = null
        state.fetch.status = "loading"
      })
      .addCase(fetchSubjects.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        if (!state.subjects) {
          state.subjects = {}
        }
        state.subjects[page] = docs
        state.total = totalDocs
        state.fetch.status = "succeeded"
      })
      .addCase(fetchSubjects.rejected, (state, action: any) => {
        state.fetch.error = action.error?.message || "Une erreur inconnue est survenue."
        state.fetch.status = "failed"
      })
      .addCase(createSubject.pending, (state) => {
        state.create.error = null
        state.create.status = "loading"
      })
      .addCase(createSubject.fulfilled, (state, action: PayloadAction<any>) => {
        const { page, docs, totalDocs } = action.payload.data
        state.subjects = {}
        state.subjects[page] = docs
        state.total = totalDocs
        state.create.status = "succeeded"
      })
      .addCase(createSubject.rejected, (state, action: any) => {
        state.create.error = action.error?.message || "Une erreur inconnue est survenue."
        state.create.status = "failed"
      })
      .addCase(updateSubject.pending, (state) => {
        state.update.error = null
        state.update.status = "loading"
      })
      .addCase(updateSubject.fulfilled, (state, action: any) => {
        if (state.subjects) {
          const { _id: id } = action.payload.data.subject
          const allSubjects = flattenPaginatedData<ISubject>(state.subjects!)
          const updatedSubjects = allSubjects.map((subject) => {
            if (subject._id === id) {
              return action.payload.data.subject
            }
            return subject
          })
          const reorderedSubjectsPerPage = paginateData(updatedSubjects, subjectsPerPage)
          state.subjects = reorderedSubjectsPerPage
        }
        state.update.status = "succeeded"
      })
      .addCase(updateSubject.rejected, (state, action: any) => {
        state.update.error = action.error?.message || "Une erreur inconnue est survenue."
        state.update.status = "failed"
      })
      .addCase(deleteSubject.pending, (state) => {
        state.delete.error = null
        state.delete.status = "loading"
      })
      .addCase(deleteSubject.fulfilled, (state, action: any) => {
        const { page, docs, totalDocs } = action.payload.data
        state.subjects = {}
        state.subjects[page] = docs
        state.total = totalDocs
        state.delete.status = "succeeded"
      })
      .addCase(deleteSubject.rejected, (state, action: any) => {
        state.delete.error = action.error?.message || "Une erreur inconnue est survenue."
        state.delete.status = "failed"
      })
      .addCase(fetchSubjectRelatedData.fulfilled, (state, action: any) => {
        state.delete.relatedData = action.payload.data
      })
  },
})

export const {
  removeUnit,
  updateUnit,
  removeLevel,
  updateStudyField,
  removeStudyField,
  updateDiploma,
  removeDiploma,
  restoreFetch,
  restoreCreate,
  restoreUpdate,
  restoreDelete,
} = subjectSlice.actions

export default subjectSlice.reducer
