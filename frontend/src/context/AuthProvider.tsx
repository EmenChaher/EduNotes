import { useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import axiosInstance from "../utils/axios"
import { clearAccessToken, getAccessToken } from "../utils/token"
import useIsMountedRef from "../hook/useIsMountedRef"
import { useAppDispatch, useAppSelector } from "@src/store"
import { initialise } from "@src/store/slices/shared/auth/slice"
import LazyLoad from "@src/components/LazyLoad"

interface AuthProviderProps {
  children: React.ReactNode
}

interface JwtPayload {
  id: string
  iat: number
  exp: number
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const isMounted = useIsMountedRef()

  const { isInitialised } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const isValidToken = (token: string) => {
    const { exp } = getTokenPayload(token)
    const currentTime = Date.now() / 1000
    return exp > currentTime
  }

  const getTokenPayload = (token: string): JwtPayload => {
    return jwtDecode(token)
  }

  useEffect(() => {
    if (!isMounted.current) {
      return
    }

    async function fetchUser() {
      const access_token = getAccessToken()
      try {
        if (access_token && typeof access_token === "string" && isValidToken(access_token)) {
          const response = await axiosInstance.get("/me")
          if (response.status === 200) {
            return dispatch(initialise({ isAuthenticated: true, user: response?.data?.data?.user }))
          }
        }
        clearAccessToken()
        dispatch(initialise({ isAuthenticated: false, user: null }))
      } catch (error) {
        console.error("An error occurred while fetching user:", error)
        if (access_token) clearAccessToken()
        dispatch(initialise({ isAuthenticated: false, user: null }))
      }
    }

    fetchUser()
  }, [])

  if (!isInitialised) {
    return <LazyLoad />
  }

  return <>{children}</>
}

export default AuthProvider
