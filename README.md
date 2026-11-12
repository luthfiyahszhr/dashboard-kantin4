# Sistem Review Kantin

Aplikasi monorepo untuk menjelajahi warung kantin kampus, mengelola warung berbasis role, dan mengautentikasi pengguna. Frontend React berkomunikasi dengan REST API Express melalui Axios; backend menyimpan data pada SQL Server menggunakan Drizzle ORM.

## Teknologi

- Backend: Node.js, Express 5, TypeScript, Drizzle ORM, SQL Server, Zod, JWT, bcryptjs, CORS.
- Frontend: React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS 4.
- Metode HTTP frontend: Axios saja. Base URL dibaca dari `VITE_API_BASE_URL`.

## Prasyarat

- Node.js 22.18 atau lebih baru dan npm.
- SQL Server 2022 atau SQL Server yang kompatibel, tersedia pada host/port yang dapat diakses backend.
- `sqlcmd` untuk menjalankan file setup database.
- macOS: pasang `sqlcmd` dengan `brew install sqlcmd`.

SQL Server dapat dipasang sebagai service lokal. Alternatif Docker pada host Linux/x86-64:

```sh
docker run --platform linux/amd64 --name kantin-sqlserver -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD='<password-sa-lokal>' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

Gunakan password lokal yang memenuhi persyaratan SQL Server dan jangan simpan nilainya ke Git. Pada Docker Desktop di Apple Silicon, aktifkan "Use Rosetta for x86_64/amd64 emulation". Untuk container, SQL Authentication sudah aktif sehingga `00-setup-mixed-mode.sql` tidak perlu dijalankan.

## Setup Database

Jalankan perintah berikut dari root repo. Untuk SQL Server lokal Windows, aktifkan mixed mode sekali dan restart service jika diperlukan:

```powershell
sqlcmd -S localhost -E -C -i backend/db/00-setup-mixed-mode.sql
sqlcmd -S localhost -E -C -v DB_PASSWORD='<password-login-aplikasi>' -i backend/db/01-create-database-and-user.sql
sqlcmd -S localhost -E -C -i backend/db/02-schema.sql
```

Untuk SQL Server Docker, lewati mixed-mode setup dan jalankan perintah dengan login `sa`:

```sh
sqlcmd -S localhost -U sa -P '<password-sa-lokal>' -C -v DB_PASSWORD='<password-login-aplikasi>' -i backend/db/01-create-database-and-user.sql
sqlcmd -S localhost -U sa -P '<password-sa-lokal>' -C -i backend/db/02-schema.sql
```

`DB_PASSWORD` pada perintah create-user adalah password SQL login aplikasi yang sama dengan nilai `DB_PASSWORD` di `backend/.env`; `-P` adalah password lokal `sa`. File seed SQL lama hanya memberi arahan; akun uji harus dibuat melalui seed bcrypt aplikasi.

## Backend

```sh
cd backend
npm install
cp .env.example .env
```

Isi `backend/.env` dengan konfigurasi lokal. Contoh nama variabel tanpa secret tersedia di `.env.example`. `JWT_SECRET` minimal 32 byte; `SEED_PASSWORD` wajib ditetapkan, minimal 8 karakter dan maksimal 72 byte. Nilai ini tidak memiliki default di kode.

```sh
npm run typecheck
npm run seed
npm run dev
```

API tersedia di `http://localhost:3000/api/v1`; pemeriksaan DB ada di `/health`, dokumentasi Swagger di `/docs`. `npm run seed` aman dijalankan ulang dan membuat hash password bcrypt serta enam warung dari dua owner.

## Frontend

```sh
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend Vite biasanya tersedia di `http://localhost:5173`. `VITE_API_BASE_URL` default contoh adalah `http://localhost:3000/api/v1`.

## Endpoint API

Semua endpoint API selain health/docs memakai prefix `/api/v1`.

| Method | Path | Auth/role |
| --- | --- | --- |
| GET | `/health` | Public |
| POST | `/api/v1/auth/register` | Public; role baru customer |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Login |
| GET | `/api/v1/stalls` | Public; search/category/page/limit |
| GET | `/api/v1/stalls/:id` | Public |
| GET | `/api/v1/stalls/:id/menus` | Public |
| POST | `/api/v1/stalls` | Owner, admin |
| PUT | `/api/v1/stalls/:id` | Admin atau owner pemilik |
| DELETE | `/api/v1/stalls/:id` | Admin |
| POST | `/api/v1/stalls/:id/reviews` | Login |
| GET | `/docs` | Public Swagger UI |

Detail body, Zod validation, response, error, dan aturan ownership ada di [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

## Akun Uji

Jalankan seed setelah database siap. Semua akun menggunakan password dari `SEED_PASSWORD` di `backend/.env`.

| Role | Email |
| --- | --- |
| Admin | `admin@example.test` |
| Owner | `owner1@example.test` |
| Owner | `owner2@example.test` |
| Customer | `customer@example.test` |

## Pengujian Manual

Langkah dan bukti untuk 12 kasus ada di [docs/TEST_SCENARIOS.md](docs/TEST_SCENARIOS.md). Skenario butuh backend dan SQL Server aktif; build/typecheck tidak menggantikan pemeriksaan simpanan database.

## Struktur Repo

```text
backend/   Express API, SQL scripts, Drizzle schema, seed, Swagger
frontend/  React app, Axios API layer, routes, pages, components, hooks, types
docs/      API contract dan skenario pengujian
```

Rahasia database, JWT, token, dan password seed tidak boleh di-commit. `.env` diabaikan Git; commit hanya `.env.example` tanpa nilai rahasia. Password SQL lama pernah muncul pada riwayat Git, jadi rotasi password tersebut sebelum memakai repo ini secara publik. Folder `hands-on-*` lama tetap tersedia sebagai materi praktikum, bukan paket aktif monorepo.
