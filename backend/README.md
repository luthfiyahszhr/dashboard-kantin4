# Backend Sistem Review Kantin

REST API untuk autentikasi pengguna dan pengelolaan data warung kantin. API menggunakan JWT untuk autentikasi, validasi Zod, dan menyimpan data melalui Drizzle ORM ke SQL Server.

## Teknologi

- Express 5 dan TypeScript
- Drizzle ORM dengan driver MSSQL
- SQL Server
- Zod 4
- JWT dan bcryptjs
- Swagger UI (`swagger-autogen`)

## Prasyarat

- Node.js >= 22.18 dan npm
- SQL Server yang dapat diakses melalui TCP port 1433 (atau port yang dikonfigurasi)
- `sqlcmd` untuk menjalankan skrip SQL dari host

## Setup Database

Semua perintah di bawah dijalankan dari folder `backend/`.

### Windows: SQL Server lokal

Jika SQL Server masih menggunakan Windows-only authentication, aktifkan mixed mode satu kali, lalu restart service:

```powershell
sqlcmd -S localhost -E -C -i db\00-setup-mixed-mode.sql
```

Buat database dan login aplikasi, lalu buat tabel:

```powershell
sqlcmd -S localhost -E -C -v DB_PASSWORD='<password-login-aplikasi>' -i db\01-create-database-and-user.sql
sqlcmd -S localhost -E -C -i db\02-schema.sql
```

### macOS/Linux: SQL Server di Docker

Jalankan SQL Server container (gunakan password lokal yang memenuhi aturan SQL Server; jangan masukkan nilainya ke Git):

```sh
docker run --name kantin-sqlserver \
  -e ACCEPT_EULA=Y \
  -e MSSQL_SA_PASSWORD='<password-sa-lokal>' \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest
```

Jalankan setup memakai `sqlcmd` dari host. Container sudah menyediakan SQL Authentication, jadi tidak perlu menjalankan `00-setup-mixed-mode.sql`:

```sh
sqlcmd -S localhost -U sa -P '<password-sa-lokal>' -C \
  -v DB_PASSWORD='<password-login-aplikasi>' \
  -i db/01-create-database-and-user.sql
sqlcmd -S localhost -U sa -P '<password-sa-lokal>' -C -i db/02-schema.sql
```

Image SQL Server Linux umumnya ditujukan untuk x86-64. Pada Apple Silicon, gunakan image/platform yang kompatibel (dengan emulasi bila tersedia), VM, atau server SQL Server remote.

`db/01-create-database-and-user.sql` berisi variabel SQLCMD `$(DB_PASSWORD)`. Variabel tersebut hanya diganti oleh opsi `sqlcmd -v DB_PASSWORD=...`; variabel shell, `.env`, atau `dotenv` tidak melakukan substitusi di dalam file SQL. Jangan menjalankan file tersebut tanpa `-v DB_PASSWORD=...`.

## Konfigurasi Environment

Salin contoh konfigurasi ke file lokal:

```sh
cp .env.example .env
```

Isi `.env` dengan nilai lokal. Jangan commit `.env` atau secret asli.

| Variabel | Kegunaan |
| --- | --- |
| `DB_SERVER` | Host SQL Server, misalnya `localhost`. |
| `DB_PORT` | Port SQL Server, umumnya `1433`. |
| `DB_USER` | Login SQL Server aplikasi (`praktikum_user` pada setup SQL). |
| `DB_PASSWORD` | Password lokal login SQL Server aplikasi; samakan dengan nilai `-v DB_PASSWORD` saat membuat login. |
| `DB_NAME` | Database aplikasi, yaitu `review_kantin`. |
| `DB_ENCRYPT` | Aktifkan enkripsi koneksi SQL Server jika `true`; contoh lokal memakai `false`. |
| `DB_TRUST_SERVER_CERTIFICATE` | Percayai sertifikat server lokal jika `true`; sesuaikan dengan konfigurasi SQL Server. |
| `JWT_SECRET` | Secret JWT, wajib minimal 32 byte. Gunakan nilai acak dan rahasiakan. |
| `CORS_ORIGIN` | Origin frontend yang diizinkan; default kode `http://localhost:5173`. |
| `SEED_PASSWORD` | Password bersama akun uji; wajib diisi, minimal 8 karakter dan maksimal 72 byte UTF-8. Tidak ada password default dalam kode. |
| `PORT` (opsional) | Port HTTP backend; default `3000`. Variabel ini tidak wajib dicantumkan di `.env.example`. |

## Menjalankan Backend

Dari folder `backend/`:

```sh
npm install
npm run seed
npm run dev
```

`npm run seed` membuat hash bcrypt dari `SEED_PASSWORD` dan aman dijalankan berulang. `npm run dev` membuat ulang file Swagger sebelum server berjalan. Pemeriksaan tipe: `npm run typecheck` (secara otomatis menjalankan `docs:gen` lebih dahulu).

## Akun Seed

Semua akun memakai nilai lokal `SEED_PASSWORD`; password tidak dicantumkan di README.

| Role | Email |
| --- | --- |
| Admin | `admin@example.test` |
| Owner | `owner1@example.test` |
| Owner | `owner2@example.test` |
| Customer | `customer@example.test` |

Seed juga membuat enam warung dengan dua owner dan beberapa kategori untuk menguji pencarian, filter, serta pagination.

## Endpoint

Base path API adalah `/api/v1`.

| Method | Path | Akses |
| --- | --- | --- |
| GET | `/health` | Public; memeriksa koneksi database |
| POST | `/api/v1/auth/register` | Public; akun baru menjadi customer |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Semua role yang login |
| GET | `/api/v1/stalls` | Public |
| GET | `/api/v1/stalls/:id` | Public |
| GET | `/api/v1/stalls/:id/menus` | Public |
| POST | `/api/v1/stalls` | Owner dan admin |
| PUT | `/api/v1/stalls/:id` | Admin atau owner warung tersebut |
| DELETE | `/api/v1/stalls/:id` | Admin saja |
| POST | `/api/v1/stalls/:id/reviews` | Semua role yang login |
| GET | `/docs` | Public; Swagger UI |

Owner membuat warung dengan `ownerId` dari token dan hanya dapat mengubah warung miliknya. Admin dapat membuat, mengubah, dan menghapus semua warung. Customer hanya dapat membaca daftar/detail/menu dan membuat review saat login. Backend tetap menjadi penjaga utama akses.

## Format Respons

Contoh sukses login:

```json
{
  "status": "success",
  "data": {
    "user": { "id": 1, "name": "Admin Kantin", "email": "admin@example.test", "role": "admin" },
    "token": "<JWT>"
  }
}
```

Contoh validasi Zod (`400`) dan error field:

```json
{
  "message": "Validasi input gagal",
  "errors": [
    { "field": "email", "message": "alamat email tidak valid" },
    { "field": "password", "message": "Password wajib diisi" }
  ]
}
```

Error umum menggunakan `{ "message": "..." }`; jika ada rincian validasi/field, ditambahkan `errors: [{ "field": "...", "message": "..." }]`. Contoh status lain: `401` token/kredensial tidak valid, `403` role/ownership tidak diizinkan, `404` resource tidak ditemukan, `413` ukuran request terlalu besar, dan `500` kesalahan server.

## Swagger

Swagger UI tersedia di `http://localhost:3000/docs` (atau port yang ditetapkan melalui `PORT`).
