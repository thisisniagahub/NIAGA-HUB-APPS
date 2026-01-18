
# Getting Started with StartupOS

Welcome to **StartupOS**, the integrated operating system for founders. This guide will help you set up your development environment and get the application running locally.

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**
- A **Google Cloud API Key** with access to Gemini API.

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/startupos.git
   cd startupos
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
   Add your API keys:
   ```env
   # Required for AI features
   API_KEY=your_google_gemini_api_key_here
   
   # Optional: For Phase 9 Backend (Production Mode)
   DATABASE_URL="postgresql://user:password@localhost:5432/startupos"
   JWT_SECRET="your_secret_key"
   AWS_ACCESS_KEY_ID="minio_or_aws_key"
   AWS_SECRET_ACCESS_KEY="minio_or_aws_secret"
   AWS_BUCKET_NAME="startupos-files"
   ```

## Running the Application

### 1. Frontend (Development Server)
Start the Vite development server. This is all you need for the **Local Demo** mode.
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

### 2. Backend API (Optional / Production)
To enable the Cloud persistence, File Uploads, and Database Migration features:
```bash
npm run start:api
```
The server will start on `http://localhost:3000`.

## Docker Setup (One-Click)

To spin up the entire stack (Frontend + Backend + Postgres) using Docker:

```bash
docker-compose up --build
```

## Testing

- **Unit Tests**: Run Vitest for logic and services.
  ```bash
  npm run test:unit
  ```
- **E2E Tests**: Run Playwright for browser flows.
  ```bash
  npm run test
  ```

## Key Commands

| Command | Description |
| :--- | :--- |
| `npm run lint` | Check for code quality issues using ESLint. |
| `npm run format` | Auto-format code using Prettier. |
| `npm run build` | Compile the project for production. |
