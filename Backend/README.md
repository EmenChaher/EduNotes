# Instructions:

## First check

Make sure the private and public keys exist in the keys folder, if no, run these commands

```
$ cd keys
$ openssl genrsa -out private.pem 2048
$ openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

## Without Docker

#### Check if environment variables are well set

```
$ npm run check
```

#### Make sure roles and admin users exist

With this command, you'll be able to generate the admin if it doesn't exist; For test, the database will be dropped (deleted) each time.

```
$ npm run seed
```

#### Run unit tests

```
$ npm run test
```

---

## With Docker

#### Run the server (development)

```
$ COMPOSE_HTTP_TIMEOUT=600 docker-compose -f docker-compose.dev.yml up --build
```

#### Run tests

```
$ docker exec -it starterbackend bash
$ npm run test
```
