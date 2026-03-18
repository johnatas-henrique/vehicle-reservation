# Vehicle Reservation API

Projeto de exemplo em NestJS para gerenciamento de veículos e reservas usando MongoDB.

## ✅ Pré-requisitos

- Node.js >= 20
- npm
- Docker / Docker Compose (opcional, recomendado para reproduzir ambiente local)

## 🐳 Docker

```bash
# build and start API + Mongo
docker compose up --build -d

# stop
docker compose down
```

## ▶️ Instalação e execução local

```bash
# instalar dependências
npm install

# dev (hot reload)
npm run start:dev

# prod
npm run start:prod
```

A API fica em `http://localhost:3000`.

## 🔐 Variáveis de ambiente

- `MONGO_URI` (ex: `mongodb://localhost:27017/vehicle-reservation`)
- `JWT_SECRET` (ex: `changemeinprod`)
- `JWT_EXPIRES_IN` (ex: `3600s`)
- `PORT` (ex: `3000`)

Exemplos em `.env.sample`.

## 🧪 Testes

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## 🧩 Visão geral da API

Funcionalidades principais:
- Autenticação JWT com roles (`admin`, `user`)
- CRUD de usuários
- CRUD de veículos (com `active` e `inactiveReason`)
- Reserva de veículo com regras:
  - Usuário pode ter no máximo 1 reserva `active`
  - Veículo não pode ter mais de 1 reserva `active`
  - Veículo com `active: false` não pode ser reservado
  - `cancel` / `finish` com controle de proprietário e admin
- Seed de admin automático em ambiente não-test

## 📝 Notas para quem for testar

- Primeiro login: `admin@localhost.com` / `admin123`
- Seed admin + vehicles acontece no bootstrap (não em `NODE_ENV=test`)
- Verificar endpoints de health, auth, users, vehicles, reservations

## 🔗 Postman

Collection pronta em `postman/vehicle-reservation_collection.json` com:
- `GET /health`
- `POST /auth/login`
- `POST /users`, `PUT /users/:id`, `DELETE /users/:id`
- `POST /vehicles`, `GET /vehicles`, `PUT /vehicles/:id`, `DELETE /vehicles/:id`
- `POST /reservations`, `GET /reservations/user/:id`, `PUT /reservations/:id/cancel`, `PUT /reservations/:id/finish`
