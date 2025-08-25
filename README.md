# Bitespeed Identity Reconciliation (SQLite version)

## Quickstart

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

SQLite database file is `dev.db`.

### API

`POST /identify` with JSON:
```json
{ "email": "mcfly@hillvalley.edu", "phoneNumber": "123456" }
```
