/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, Fragment } from "react"
import { Routes, Route, RouteProps } from "react-router-dom"
import pages from "./routes"
import LazyLoad from "@src/components/LazyLoad"
import { UserTypes } from "@src/models/user"
import UserTypeGuard from "./guards/UserTypeGuard"
import AuthGuard from "./guards/AuthGuard"

type RouteConfig = {
  exact: boolean | null
  path: string
  component: React.ComponentType<any>
  guard?: React.ComponentType<any> | typeof Fragment
  layout?: React.ComponentType<any> | typeof Fragment
  userTypes?: UserTypes[]
} & RouteProps

export const renderRoutes = (routes: RouteConfig[] = []) => (
  <Suspense fallback={<LazyLoad />}>
    <Routes>
      {routes.map((route, index) => {
        const Component = route.component
        const Guard = route?.guard || Fragment
        const Layout = route?.layout || Fragment
        const isAuthGuard = Guard === AuthGuard

        return (
          <Route
            key={index}
            path={route.path}
            element={
              <Guard>
                {isAuthGuard ? (
                  <UserTypeGuard userTypes={route?.userTypes}>
                    <Layout>
                      <Component />
                    </Layout>
                  </UserTypeGuard>
                ) : (
                  <Layout>
                    <Component />
                  </Layout>
                )}
              </Guard>
            }
          />
        )
      })}
    </Routes>
  </Suspense>
)

const routes: RouteConfig[] = [...pages]

export default routes
