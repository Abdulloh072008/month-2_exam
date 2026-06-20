import {lazy} from "react"

export const DashBoard = lazy(() => import("../pages/DashBoard/Dashboard"))
export const Login = lazy(() => import("../pages/Auth/login/Login"))
export const Registration = lazy(() => import("../pages/Auth/Registration/Registration"))
export const Folders = lazy(() => import("../pages/Folders/Folders"))
export const Debts = lazy(() => import("../pages/Debts/Debts"))
export const Contacts = lazy(() => import("../pages/Contacts/Contacts"))
export const  MyProfile = lazy(() => import("../pages/MyProfile/MyProfile"))
export const DebtProfile = lazy(() => import("../pages/DebtDetails/DebtDetails"))