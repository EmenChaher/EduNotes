import {  getAccessToken } from './token'
import axios from 'axios'

const baseURL = import.meta.env.VITE_APP_EXPRESS_BASE_URL as string
const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

const axiosInstance = axios.create({
  baseURL,
  headers,
  // withCredentials: true,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const access_token = getAccessToken()
    if (access_token) {
      config.headers['Authorization'] = `Bearer ${access_token}`
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

export default axiosInstance
