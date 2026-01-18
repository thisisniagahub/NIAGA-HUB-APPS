
# API & Data Schema Reference

## Data Model (Prisma Schema)

Based on `types.ts`, the following schema represents the core data structure of StartupOS.

```prisma
// Core User & Auth
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(FOUNDER)
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
}

enum Role {
  FOUNDER
  OPERATOR
  INVESTOR
  ADMIN
}

// Strategy Module
model Investor {
  id          String   @id @default(uuid())
  name        String
  firm        String
  status      InvStatus
  checkSize   String?
  lastContact DateTime
  notes       String?
  companyId   String
}

// Sales Module
model SalesDeal {
  id           String      @id @default(uuid())
  leadName     String
  company      String
  value        Float
  stage        SalesStage
  probability  Int
  lastActivity DateTime
  companyId    String
}
```

## API Endpoints

The backend (located in `server/server.ts`) exposes the following REST endpoints.

### Authentication

#### `POST /api/auth/login`
Authenticates a user and returns a JWT.

**Request:**
```json
{
  "email": "admin@startupos.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUz...",
  "user": { "id": "1", "name": "Admin", "role": "ADMIN" }
}
```

### Data Migration

#### `POST /api/v1/migrate`
Syncs `localStorage` data to the PostgreSQL database.

**Request:**
```json
{
  "companyName": "My Startup",
  "investors": [...],
  "deals": [...],
  "features": [...]
}
```

**Response:**
```json
{
  "success": true,
  "companyId": "uuid-123",
  "recordsCreated": 45
}
```

### Files & Storage

#### `POST /api/files/upload`
Uploads a file to S3 (or mock storage).

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Response:**
```json
{
  "success": true,
  "url": "https://s3.amazonaws.com/bucket/file.pdf",
  "name": "pitch_deck.pdf"
}
```

### Webhooks

#### `POST /api/webhooks/stripe`
Handles Stripe checkout completion events to provision subscriptions.
