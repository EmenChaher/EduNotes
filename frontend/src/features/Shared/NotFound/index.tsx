import Error from "@src/components/Error"

const NotFound = () => {
  return (
    <Error
      title="Page Non Trouvée"
      subTitle="Désolé, la page que vous recherchez est introuvable. Veuillez vérifier l'URL ou revenir à la page précédente."
      status={404}
    />
  )
}

export default NotFound
