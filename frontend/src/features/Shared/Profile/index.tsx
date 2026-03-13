import LayoutHeader from "@src/layout/LayoutHeader"
import Security from "./Security/Security"
import Information from "./Information"

const Profile: React.FC = () => {
  return (
    <>
      <LayoutHeader title="Profile" />
      <div className="flex tiny:flex-col xl:flex-row tiny:gap-8 2xl:gap-10 3xl:gap-20 justify-around">
        <Information />
        <Security />
      </div>
    </>
  )
}

export default Profile
