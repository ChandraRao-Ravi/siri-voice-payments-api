# 🛠️ Siri Voice Payments API

Backend API for the **Siri-style voice payments** app.  
Provides authentication, a mock bank account, payee management, payment intents, and transaction history.

Designed for local development with **SQLite** and ready to deploy on **Render**’s free tier. [web:358][web:292]

---

## 🧱 Stack

- ⚙️ Node.js + Express (REST API)
- 📝 TypeScript
- 🗄️ Prisma ORM + SQLite (dev) [web:367]
- 🔐 JSON Web Tokens (JWT) for auth
- ☁️ Render-friendly build & start commands [web:351][web:295]

---

## 🗂️ Project Structure

```text
.
├─ prisma/
│  ├─ schema.prisma       # Data models (User, Account, Payee, Transaction, PaymentIntent)
│  └─ migrations/         # Prisma migrations
├─ src/
│  ├─ app.ts              # Express app wiring
│  ├─ server.ts           # Server entrypoint
│  ├─ config/
│  │  └─ env.ts           # Env variables (PORT, JWT_SECRET)
│  ├─ db/
│  │  └─ prisma.ts        # PrismaClient instance
│  ├─ middleware/
│  │  └─ authMiddleware.ts# JWT auth middleware (req.auth)
│  ├─ controllers/        # Route handlers
│  └─ routes/             # Express routers
├─ prisma.config.ts
├─ package.json
└─ tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (LTS)
- npm
- SQLite (no extra setup needed)
- Prisma CLI (via `npx`) [web:367]

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me"
PORT=4000
```

- `DATABASE_URL` – SQLite file used by Prisma.
- `JWT_SECRET` – secret key for signing JWTs.
- `PORT` – API port (Render will override this with its own `PORT`).

### 4. Database setup

Run migrations and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates `prisma/dev.db` and applies the schema. [web:367]

### 5. Run in development

```bash
npm run dev
```

Health check:

```bash
GET http://localhost:4000/health
# → { "status": "ok" }
```

---

## 🔐 Authentication

- `POST /auth/register`  
  Create a new user and mock account.

  ```json
  {
    "email": "test@example.com",
    "password": "pass123"
  }
  ```

- `POST /auth/login`  
  Returns an `accessToken` (JWT) plus user + account summary.

  ```json
  {
    "email": "test@example.com",
    "password": "pass123"
  }
  ```

Use the token like:

```http
Authorization: Bearer <accessToken>
```

---

## 💳 Account & Transactions

- `GET /account`  
  Get current account balance and currency.

- `GET /account/transactions?limit=5`  
  Get recent transactions (default limit 5) including payee info.

Example response (simplified):

```json
[
  {
    "id": 1,
    "amountPaise": 100000,
    "direction": "debit",
    "description": "Voice payment",
    "status": "success",
    "createdAt": "2026-06-10T15:30:00.000Z",
    "payee": {
      "id": 1,
      "alias": "House Owner",
      "name": "Ramesh Kumar"
    }
  }
]
```

---

## 👥 Payees

- `POST /payees` – Create a payee for the current user.

  ```json
  {
    "alias": "House Owner",
    "name": "Ramesh Kumar",
    "accountRef": "ramesh@upi"
  }
  ```

- `GET /payees` – List all payees.

- `GET /payees/:id` – Get a payee by id.

- `GET /payees/by-alias/:alias` – Lookup payee by alias (case-insensitive).

---

## 💸 Payment Intents

These endpoints support the voice flow from the app.

- `POST /payments/intents` – Create a payment intent.

  ```json
  {
    "payeeId": 1,
    "amountPaise": 100000,
    "clientRef": "optional-client-side-id"
  }
  ```

- `POST /payments/intents/:id/confirm` – Confirm and execute the payment.  
  Handles balance check, creates a `Transaction`, and marks the intent as `confirmed`.

- `GET /payments/intents/:id` – Fetch a payment intent by id.

---

## 📲 App Config

- `GET /app/config` – Feature flags + summary for the mobile app:

  - `featureFlags.voicePaymentsEnabled`
  - `featureFlags.maxAmountPaise`
  - `featureFlags.requiresBiometrics`
  - `userSummary` with balance and currency

Used by the iOS app to conditionally enable voice payment behavior.

---

## ☁️ Deployment on Render

This project is set up to deploy easily on **Render**’s free tier. [web:358][web:292][web:362]

1. Push this repo to GitHub (do **not** commit `node_modules`, `dist`, or `prisma/dev.db`).
2. On [Render](https://render.com), click **New → Web Service**. [web:351][web:358]
3. Connect your GitHub repo.
4. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance type**: Free [web:292][web:371]

5. Set environment variables in Render: [web:356]

   - `NODE_ENV=production`
   - `JWT_SECRET=<some-long-random-string>`
   - `DATABASE_URL=file:./dev.db`  
     (or a Postgres URL later)
   - `PORT` – leave blank; Render supplies this and the app uses `process.env.PORT`.

6. Deploy and wait for the build to finish. Your API will be available at:

```text
https://<your-service>.onrender.com
```

Confirm with:

```bash
GET https://<your-service>.onrender.com/health
```

---

## 🧪 Local Test Flow

1. Register and login to get `accessToken`.
2. Create a payee.
3. Create a payment intent for that payee.
4. Confirm the intent.
5. Check `/account` and `/account/transactions` to see updated balance and history.

---

## 📦 Git Ignore

Typical `.gitignore` for this project:

```gitignore
node_modules
dist
prisma/dev.db
.env
```

---

## 📲 Related Repos

- 📱 **iOS App (Siri Voice Payments)**: _add your app repo URL here_
- 🛠️ **This API**: you are here 😄
