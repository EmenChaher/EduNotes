import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { login } from "./thunk/login"
import { register } from "./thunk/register"
import { clearAccessToken, setAccessToken } from "@src/utils/token"
import { IUser } from "@src/models/user"

type UserData = {
  access_token: string
  user: IUser
}

export type LoginResponse = {
  statusCode: number
  message: string
  data: UserData
}

export type RegisterResponse = {
  statusCode: number
  message: string
}

export interface AuthState {
  status: string
  isAuthenticated: boolean
  isInitialised: boolean
  user: IUser | null
  error: string | null
}

const initialState: AuthState = {
  status: "idle",
  isAuthenticated: false,
  isInitialised: false,
  user: null,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initialise: (state, action) => {
      const { isAuthenticated, user } = action.payload
      state.isAuthenticated = isAuthenticated
      state.isInitialised = true
      state.user = user
    },
    restore: (state) => {
      state.error = null
      state.status = "idle"
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      clearAccessToken()
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.error = null
      state.status = "loading"
    })
    builder.addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
      const { access_token, user } = action.payload.data
      setAccessToken(access_token)
      state.isAuthenticated = true
      state.user = user
      state.status = "succeeded"
    })
    builder.addCase(login.rejected, (state, action: any) => {
      state.error = action.error?.message || "Une erreur inconnue est survenue."
      state.status = "failed"
    })
    builder.addCase(register.pending, (state) => {
      state.error = null
      state.status = "loading"
    })
    builder.addCase(register.fulfilled, (state) => {
      state.status = "succeeded"
    })
    builder.addCase(register.rejected, (state, action: any) => {
      state.error = action.error?.message || "Une erreur inconnue est survenue."
      state.status = "failed"
    })
  },
})

export const { initialise, restore, logout } = authSlice.actions

export default authSlice.reducer
