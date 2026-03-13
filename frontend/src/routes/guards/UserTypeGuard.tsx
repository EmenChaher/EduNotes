import Error from "@src/components/Error"
import { UserTypes } from "@src/models/user"
import { useAppSelector } from "@src/store"

interface MainLayoutProps {
  children: React.ReactNode
  userTypes?: UserTypes[]
}

const UserTypeGuard = ({ children, userTypes }: MainLayoutProps) => {
  const { type } = useAppSelector((state) => state.auth.user)!

  if (userTypes && userTypes.length > 0) {
    if (!userTypes.includes(type)) {
      return (
        <Error
          status={403}
          title="Accès restreint"
          subTitle="Désolé, vous n'avez pas la permission d'accéder à cette page."
          button={{ redirect: "/profile", text: "Aller au profile" }}
        />
      )
    }
  }

  return <>{children}</>
}

export default UserTypeGuard
