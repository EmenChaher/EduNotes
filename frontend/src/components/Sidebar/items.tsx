import { IconType } from "react-icons"
import { UserTypes } from "@src/models/user"
import { SiGoogleclassroom } from "react-icons/si"
import { GiDiploma } from "react-icons/gi"
import { VscSymbolField } from "react-icons/vsc"
import { SiLevelsdotfyi } from "react-icons/si"
import { ImProfile } from "react-icons/im"
import { MdClass } from "react-icons/md"
import { BiUnite } from "react-icons/bi"
import { MdSubject } from "react-icons/md"
import { FaCog } from "react-icons/fa"
import { FaUsersGear } from "react-icons/fa6"
import { GiTeacher } from "react-icons/gi"
import { IoStatsChart } from "react-icons/io5"

export interface ISidebarItem {
  label: string
  link?: string
  icon: IconType
  userTypes?: string[]
  collapsed?: boolean
  children?: ISidebarItem[]
}

export const sidebarItems: ISidebarItem[] = [
  {
    link: "/profile",
    label: "Profile",
    icon: ImProfile,
  },
  {
    link: "/enseignant/classes",
    label: "Classes",
    icon: SiGoogleclassroom,
    userTypes: [UserTypes.Teacher],
  },
  {
    link: "/enseignant/statistiques",
    label: "Statistiques",
    icon: IoStatsChart,
    userTypes: [UserTypes.Teacher],
  },
  {
    link: "/etudiant/matieres",
    label: "Matières",
    icon: MdSubject,
    userTypes: [UserTypes.Student],
  },
  {
    link: "/etudiant/statistiques",
    label: "Statistiques",
    icon: IoStatsChart,
    userTypes: [UserTypes.Student],
  },
  {
    link: "/gestion",
    label: "Gestion",
    icon: FaCog,
    userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    collapsed: true,
    children: [
      {
        link: "/utilisateurs",
        label: "Utilisateurs",
        icon: FaUsersGear,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/enseignement",
        label: "Enseignement",
        icon: GiTeacher,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/diplomes",
        label: "Diplômes",
        icon: GiDiploma,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/filieres",
        label: "Filières",
        icon: VscSymbolField,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/niveaux",
        label: "Niveaux",
        icon: SiLevelsdotfyi,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/classes",
        label: "Classes",
        icon: MdClass,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/unites",
        label: "Unités",
        icon: BiUnite,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/matieres",
        label: "Matières",
        icon: MdSubject,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
      {
        link: "/statistiques",
        label: "Statistiques",
        icon: IoStatsChart,
        userTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      },
    ],
  },
]
