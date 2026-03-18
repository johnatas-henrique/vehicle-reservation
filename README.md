# Vehicle Reservation API

Projeto de exemplo em NestJS para gerenciamento de veículos e reservas usando MongoDB.

## 🧩 Visão geral

Funcionalidades principais:
- Autenticação JWT com roles (`admin`, `user`)
- CRUD de usuários
- CRUD de veículos (com `active` e `inactiveReason`)
- Reserva de veículo com regras de negócio:
  - Usuário pode ter no máximo 1 reserva `active`
  - Veículo não pode ter mais de 1 reserva `active`
  - Veículo com `active: false` não pode ser reservado
  - `cancel` / `finish` de reservas com controle de proprietário e admin
- Seed de admin automático em ambiente não-test
- API validada com `class-validator` e `ValidationPipe`

## 🛠️ Pré-requisitos

- Node.js >= 20
- npm
- Docker / Docker Compose (opcional, recomendado para reproduzir ambiente local)

## setup local

```bash
npm install
```

## execução local

```bash
# dev (hot reload)
npm run start:dev

# prod
npm run start:prod
```

API disponível em `http://localhost:3000`.

## variáveis de ambiente

- `MONGO_URI` (ex: `mongodb://localhost:27017/vehicle-reservation`)
- `JWT_SECRET` (ex: `changemeinprod`)
- `JWT_EXPIRES_IN` (ex: `3600s`)
- `PORT` (ex: `3000`)

Exemplos em `.env.sample`.

## Docker

```bash
# build and start API + Mongo
docker compose up --build -d

# stop
docker compose down
```

## 🧪 Testes

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

Cobertura após ajustes:
- `All files` 98.29% statements

## 📬 Postman

Collection pronta em `postman/vehicle-reservation_collection.json`.

Endpoints contemplados:
- `GET /health`
- `POST /auth/login`
- `POST /users`, `PUT /users/:id`, `DELETE /users/:id`
- `POST /vehicles`, `GET /vehicles`, `PUT /vehicles/:id`, `DELETE /vehicles/:id`
- `POST /reservations`, `GET /reservations/user/:id`, `PUT /reservations/:id/cancel`, `PUT /reservations/:id/finish`

## 📌 Notas para recrutadores

- rodando localmente com Docker ou npm
- `seedAdmin` e `seedVehicles` automático na primeira execução
- API RESTful com NestJS, MongoDB e Mongoose
- Para primeiro login, use `admin@localhost.com` e `admin123`
- regras estritas de validação e guardas JWT/role
- testes unitários + e2e + coverage integrados

## ⚙️ Validação na collection

A collection já contém as requisições listadas acima para workflow completo: login, setup de token, CRUD users/vehicles/reservations.

