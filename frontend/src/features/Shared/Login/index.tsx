import { useAppDispatch, useAppSelector } from "@src/store"
import { login } from "@src/store/slices/shared/auth/thunk/login"
import { FaRegEnvelope } from "react-icons/fa6"
import { VscKey } from "react-icons/vsc"
import Input from "@src/components/Input"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import visual from "@src/assets/images/login/visual.png"
import Spinner from "@src/components/Spinner"
import { useEffect } from "react"
import { restore } from "@src/store/slices/shared/auth/slice"
import { message } from "antd"
import { Link } from "react-router-dom"

type InitialValuesType = {
  email: string
  password: string
  rememberLogin: string[]
}

const initialValues: InitialValuesType = {
  email: "",
  password: "",
  rememberLogin: [],
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch()

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Veuillez saisir une adresse email valide.")
      .required("Veuillez saisir votre adresse email."),
    password: Yup.string().required("Veuillez saisir votre mot de passe.").min(8, "Le mot de passe doit comporter 8 caractères."),
  })

  useEffect(() => {
    dispatch(restore())
  }, [])

  const { status, error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (status === "failed") {
      let errorMessage = error
      if (error === "Invalid credentials.") errorMessage = "Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe."
      message.error(errorMessage)
    }
  }, [status, error])

  const handleSubmit = async (values: any) => {
    const loginData = {
      email: values.email,
      password: values.password,
      remember: values.rememberLogin.includes("remember"),
    }
    dispatch(login(loginData))
  }

  const isLoading = status === "loading"

  return (
    <div className="min-h-dvh w-screen flex">
      <div className="tiny:w-full lg:w-3/5 flex justify-center flex-col items-center gap-16 my-8">
        <h1 className="tiny:text-xl xs:text-3xl sm:text-5xl	text-dark-blue font-semibold text-center select-none">Connectez-vous</h1>
        <div className="tiny:w-4/5 lg:w-4/5 xl:w-7/12 flex items-center ">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              handleSubmit(values)
            }}
          >
            {({ errors, touched }) => (
              <Form noValidate className="login-form flex flex-col w-full tiny:gap-8 lg:gap-16">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-5">
                    <Input
                      prefixIcon={FaRegEnvelope}
                      touched={touched.email}
                      height="h-12"
                      error={errors.email}
                      label="E-mail"
                      name="email"
                      placeholder="Entrez votre e-mail"
                    />

                    <Input
                      prefixIcon={VscKey}
                      touched={touched.password}
                      height="h-12"
                      error={errors.password}
                      type="password"
                      name="password"
                      label="Mot de passe"
                      placeholder="Entrez votre mot de passe"
                    />
                  </div>

                  <div className="flex justify-between items-baseline">
                    <div className="flex gap-2 items-center">
                      <Field type="checkbox" name="rememberLogin" id="rememberLogin" value="remember" />
                      <label htmlFor="rememberLogin">
                        <p className="font-base tiny:text-xs sm:text-base text-slate-gray select-none">Rester connecté</p>
                      </label>
                    </div>
                    <Link to="/forgotPassword">
                      <button tabIndex={-1} type="button" className="font-normal tiny:text-xs sm:text-base text-sky-blue select-none">
                        Mot de passe oublié?
                      </button>
                    </Link>
                  </div>
                </div>

                <button
                  className={`w-full rounded-lg bg-dark-blue h-12 flex flex-row gap-4 justify-center items-center ${
                    !isLoading ? "hover:brightness-95 focus:brightness-95" : "hover:cursor-not-allowed"
                  }`}
                  type="submit"
                  disabled={isLoading}
                >
                  <p className="text-white font-semibold tiny:text-lg sm:text-base select-none">{isLoading ? "Chargement" : "Soumettre"}</p>
                  {isLoading && <Spinner className="white" />}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <div className="tiny:hidden lg:block w-2/5	bg-light-blue min-h-screen">
        <div className="fixed top-0 right-0 w-2/5 h-screen flex justify-center items-center select-none">
          <img src={visual} alt="visual" className="lg:w-3/5 2xl:w-auto" />
        </div>
      </div>
    </div>
  )
}

export default Login
