# Test Certificate Generator

Full-stack application to generate Material Test Certificates with:

- Automatic Serial No and TC No generation
- Customer master and dropdown selection
- Product, grade/size, and standard master setup
- Prefilled Physical Analysis, Chemical Analysis, and Sieve Analysis rows
- Manual entry of actual test results
- Certificate register for saved records

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB

## Project Structure

```text
test-certificate-generator/
  client/
    src/
      components/
      pages/
      services/
  server/
    config/
    controllers/
    models/
    routes/
    seed/
```

## Main Workflow

1. Add customers and product masters.
2. In product master, define standard-specific grades and analysis parameters.
3. Create a new certificate.
4. Serial No and TC No are generated automatically.
5. Select existing customer or add a new one during certificate creation.
6. Select trade name, standard, and grade/size.
7. Physical, Chemical, and Sieve Analysis rows are prefilled automatically.
8. Enter actual results manually and save.

## Setup

### Backend

```bash
cd /Users/ektashah/Documents/Codex/2026-05-11/i-want-to-make-test-certitcate/server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd /Users/ektashah/Documents/Codex/2026-05-11/i-want-to-make-test-certitcate/client
cp .env.example .env
npm install
npm run dev
```

### URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Production Deployment

The app can be deployed as one Node web service. In production, Express serves the built React app from `client/dist` and keeps the API under `/api`.

Use these settings on Render:

```text
Service type: Web Service
Runtime: Node
Build Command: npm run build
Start Command: npm start
```

Set these environment variables:

```text
NODE_ENV=production
MONGO_URI=<your MongoDB Atlas connection string>
TC_PREFIX=MTC
AUTH_SECRET=<long random secret for login sessions>
```

Do not add local `.env` files to GitHub. Use the hosting provider's environment variable screen instead.

## Sample Data

Seed data includes:

- Customers: `Shivam Infra Projects`, `Prime Buildchem`
- Products: `Silica Sand`, `Calcium Carbonate Powder`
- Standards with grade/size options and analysis parameter templates

## Key APIs

- `GET /api/customers`
- `POST /api/customers`
- `GET /api/products`
- `POST /api/products`
- `GET /api/certificates/draft`
- `POST /api/certificates`
- `GET /api/certificates`

## Notes

- `TC No` format is driven by `TC_PREFIX` in the backend `.env`.
- Draft certificate numbers are preview-only; the actual saved number is generated safely when the certificate is saved, without consuming a serial just by opening the form.
- The Masters page accepts analysis rows in this format:

```text
Parameter | Required Result | Method
```
