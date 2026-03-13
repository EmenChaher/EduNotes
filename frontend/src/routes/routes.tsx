/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { Fragment, lazy } from "react"
import { Navigate, RouteProps } from "react-router-dom"

const GuestLayout = lazy(() => import("../layout/GuestLayout"))
const MainLayout = lazy(() => import("../layout/MainLayout"))

import GuestGuard from "./guards/GuestGuard"
import AuthGuard from "./guards/AuthGuard"
import { UserTypes } from "@src/models/user"

type RouteConfig = {
  exact: boolean | null
  path: string
  component: React.ComponentType<any>
  guard?: React.ComponentType<any> | typeof Fragment | any
  layout?: React.ComponentType<any> | typeof Fragment
  userTypes?: UserTypes[]
} & RouteProps

const routes: RouteConfig[] = [
  // GuestGuard Routes
  {
    exact: true,
    path: "/",
    guard: GuestGuard,
    component: () => <Navigate to="/login" />,
  },
  {
    exact: true,
    guard: GuestGuard,
    path: "/login",
    component: lazy(() => import("../pages/Shared/Login")),
    layout: GuestLayout,
  },

  {
    exact: true,
    guard: GuestGuard,
    path: "/register/:invitationToken?",
    component: lazy(() => import("../pages/Shared/Register")),
    layout: GuestLayout,
  },

  // AuthGuard Routes
  {
    exact: true,
    guard: AuthGuard,
    path: "/profile",
    component: lazy(() => import("../pages/Shared/Profile")),
    layout: MainLayout,
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/etudiant/matieres",
    component: lazy(() => import("../pages/Student/Subject")),
    layout: MainLayout,
    userTypes: [UserTypes.Student],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/etudiant/matieres/:subjectId?",
    component: lazy(() => import("../pages/Student/Grades")),
    layout: MainLayout,
    userTypes: [UserTypes.Student],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/etudiant/statistiques",
    component: lazy(() => import("../pages/Student/Statistics")),
    layout: MainLayout,
    userTypes: [UserTypes.Student],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/enseignant/classes",
    component: lazy(() => import("../pages/Teacher/Classes")),
    layout: MainLayout,
    userTypes: [UserTypes.Teacher],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/enseignant/classes/:classId?",
    component: lazy(() => import("../pages/Teacher/Subject")),
    layout: MainLayout,
    userTypes: [UserTypes.Teacher],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/enseignant/classes/:classId?/matières/:subjectId?",
    component: lazy(() => import("../pages/Teacher/SubjectTypes")),
    layout: MainLayout,
    userTypes: [UserTypes.Teacher],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/enseignant/classes/:classId?/matières/:subjectId?/:subjectType?",
    component: lazy(() => import("../pages/Teacher/SubjectTypeContents")),
    layout: MainLayout,
    userTypes: [UserTypes.Teacher],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/enseignant/classes/:classId?/matières/:subjectId?/:subjectType?/:subjectContent?",
    component: lazy(() => import("../pages/Teacher/Grades")),
    layout: MainLayout,
    userTypes: [UserTypes.Teacher],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/enseignant/statistiques",
    component: lazy(() => import("../pages/Teacher/Statistics")),
    layout: MainLayout,
    userTypes: [UserTypes.Teacher],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/diplomes",
    component: lazy(() => import("../pages/Administrator/Diploma")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/filieres",
    component: lazy(() => import("../pages/Administrator/StudyField")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/niveaux",
    component: lazy(() => import("../pages/Administrator/Level")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/classes",
    component: lazy(() => import("../pages/Administrator/Class")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/unites",
    component: lazy(() => import("../pages/Administrator/Unit")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/matieres",
    component: lazy(() => import("../pages/Administrator/Subject")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/utilisateurs",
    component: lazy(() => import("../pages/Administrator/User")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/enseignement",
    component: lazy(() => import("../pages/Administrator/Teaching")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },

  {
    exact: true,
    guard: AuthGuard,
    path: "/gestion/statistiques",
    component: lazy(() => import("../pages/Administrator/Statistics")),
    layout: MainLayout,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
  },
  {
    exact: true,
    guard: GuestGuard,
    path: "/forgotPassword",
    component: lazy(() => import("../pages/Shared/ForgotPassword")),
    layout: GuestLayout,
  },

  {
    exact: true,
    guard: GuestGuard,
    path: "/passwordReset/:passwordResetToken?",
    component: lazy(() => import("../pages/Shared/ResetPassword")),
    layout: GuestLayout,
  },

  // Public Routes
  {
    exact: true,
    path: "*",
    component: lazy(() => import("../pages/Shared/NotFound")),
  },
]

export default routes
