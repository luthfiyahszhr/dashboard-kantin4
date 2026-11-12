# API Contract: Kantin Review

> Endpoint di bawah diambil dari router, validasi, service, repository, dan DTO backend. Kontrak error final mengikuti normalisasi yang diterapkan saat tugas integrasi. Base path API: `/api/v1`; server mendengarkan port `3000`.

## Konvensi

Sukses memakai `{ status: "success", data: ... }`, kecuali daftar warung yang juga memiliki `meta`. Error memakai `{ message, errors? }`; `errors` hanya ada saat tersedia dan berisi array `{ field, message }`. Endpoint yang tidak memerlukan autentikasi dapat dipanggil public. JWT dikirim dengan `Authorization: Bearer <token>`.

## Error Final

Error validasi Zod menghasilkan HTTP `400` dengan satu entri per issue. Path Zod menjadi `field` (path bersarang digabung dengan titik, dan body-level error memakai `body` atau `request`):

```json
{
	"message": "Validasi input gagal",
	"errors": [
		{ "field": "name", "message": "Terlalu kecil: diharapkan string memiliki >=3 karakter" },
		{ "field": "email", "message": "alamat email tidak valid" }
	]
}
```

Error `401`, `403`, `404`, `409`, `413`, dan `500` memakai bentuk `{ "message": "..." }` tanpa `errors` jika tidak ada rincian field. Ukuran request terlalu besar menghasilkan HTTP `413` dengan `{ "message": "Ukuran request terlalu besar" }`. JSON malformed menghasilkan HTTP `400` dengan `errors: [{ "field": "body", "message": "Request body harus berupa JSON yang valid" }]`. Semua error aplikasi, validasi, parse JSON, dan error tak tertangani melewati satu `errorHandler`.

## Endpoint

### `GET /health`

- Auth: tidak diperlukan; role: public.
- Query/path/body: tidak ada.
- Sukses `200`: `{ "status": "success", "message": "Server dan database terhubung" }`. Handler menjalankan `SELECT 1`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `POST /api/v1/auth/register`

- Auth: tidak diperlukan; role baru selalu `customer`.
- Body (strict): `name: string` (trim, 3-100 karakter), `email: string` (trim, lowercase, email valid, maks. 150 karakter), `password: string` (8-72 karakter dan maks. 72 byte UTF-8). Field tambahan ditolak.
- Sukses `201`: `{ "status": "success", "data": { "id": 4, "name": "Ayu", "email": "ayu@example.test", "role": "customer" } }`.
- Error `400` validasi: `{ "message": "Validasi input gagal", "errors": [{ "field": "email", "message": "alamat email tidak valid" }] }`. `field` menggunakan path Zod (mis. `name`, `email`, `password`; beberapa error menghasilkan beberapa elemen).
- Error `409` email duplikat: `{ "message": "Email sudah terdaftar", "errors": [{ "field": "email", "message": "Email sudah digunakan" }] }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `POST /api/v1/auth/login`

- Auth: tidak diperlukan; role: public.
- Body (strict): `email: string` (trim, lowercase, email valid, maks. 150), `password: string` (1-72 karakter dan maks. 72 byte UTF-8; aturan minimal 8 karakter hanya berlaku saat registrasi). Field tambahan ditolak.
- Sukses `200`: `{ "status": "success", "data": { "user": { "id": 1, "name": "Admin Kantin", "email": "admin@example.test", "role": "admin" }, "token": "<JWT>" } }`.
- Error `400` validasi: `{ "message": "Validasi input gagal", "errors": [{ "field": "password", "message": "Password wajib diisi" }] }`.
- Error `401`: `{ "message": "Email atau password tidak valid" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `GET /api/v1/auth/me`

- Auth: wajib; role: `admin`, `owner`, atau `customer`.
- Header: `Authorization: Bearer <JWT>`.
- Query/path/body: tidak ada.
- Sukses `200`: `{ "status": "success", "data": { "id": 2, "name": "Owner Satu", "email": "owner1@example.test", "role": "owner" } }`.
- Error `401`: `{ "message": "Token autentikasi diperlukan" }` (token hilang), atau `{ "message": "Token tidak valid atau sudah kedaluwarsa" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `GET /api/v1/stalls`

- Auth: tidak diperlukan; role: public.
- Query: `search?: string` (trim, maks. 100; pencarian nama warung), `category?: string` (trim, maks. 50; sama persis), `page?: integer` (default 1, minimum 1), `limit?: integer` (default 10, rentang 1-100). Query numerik wajib string digit.
- Sukses `200`: `{ "status": "success", "meta": { "page": 1, "limit": 10, "total": 1 }, "data": [{ "id": 1, "ownerId": 2, "name": "Warung Bu Tini", "category": "Kwetiau", "location": "Kantin FKIP", "description": "Kedai kwetiau goreng & kuah", "avgRating": 4.5, "reviewCount": 2, "isPopular": false }] }`.
- Error `400` validasi: `{ "message": "Validasi input gagal", "errors": [{ "field": "page", "message": "Harus berupa integer" }] }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `POST /api/v1/stalls`

- Auth: wajib; role: `owner` atau `admin`.
- Body (strict): `name: string` (trim, 3-100), `category?: string` (trim, maks. 50), `location?: string` (maks. 100), `description?: string` (maks. 1000). `ownerId` tidak diterima dari body; controller mengambil ID user terautentikasi.
- Sukses `201`: `{ "status": "success", "data": { "id": 11, "ownerId": 2, "name": "Warung Baru", "category": "Nasi", "location": "Kantin A", "description": null, "avgRating": 0, "reviewCount": 0, "isPopular": false } }`.
- Error `400` validasi: `{ "message": "Validasi input gagal", "errors": [{ "field": "name", "message": "Terlalu kecil: diharapkan string memiliki >=3 karakter" }] }`.
- Error `401`: `{ "message": "Token autentikasi diperlukan" }`.
- Error `403`: `{ "message": "Anda tidak memiliki izin untuk mengakses resource ini" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `GET /api/v1/stalls/:id`

- Auth: tidak diperlukan; role: public.
- Path: `id` positive integer string.
- Sukses `200`: `{ "status": "success", "data": { "id": 1, "ownerId": 2, "name": "Warung Bu Tini", "category": "Kwetiau", "location": "Kantin FKIP", "description": "Kedai kwetiau goreng & kuah", "avgRating": 4.5, "reviewCount": 2, "isPopular": false } }`.
- Error `400`: `{ "message": "Validasi input gagal", "errors": [{ "field": "id", "message": "Harus berupa integer" }] }`.
- Error `404`: `{ "message": "Data warung tidak ditemukan" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `PUT /api/v1/stalls/:id`

- Auth: wajib; role: `admin` atau `owner` (owner hanya warung miliknya).
- Path: `id` positive integer string.
- Body (strict partial): opsional satu atau lebih dari `name: string` (trim, 3-100), `category?: string` (trim, maks. 50), `location?: string` (maks. 100), `description?: string` (maks. 1000). Body kosong ditolak; field tambahan termasuk `ownerId` ditolak.
- Sukses `200`: `{ "status": "success", "data": { "id": 1, "ownerId": 2, "name": "Nama Diperbarui", "category": "Kwetiau", "location": "Kantin FKIP", "description": "Kedai", "avgRating": 4.5, "reviewCount": 2, "isPopular": false } }`.
- Error `400`: `{ "message": "Validasi input gagal", "errors": [{ "field": "name", "message": "Terlalu kecil: diharapkan string memiliki >=3 karakter" }] }`.
- Error `401`: `{ "message": "Token autentikasi diperlukan" }`.
- Error `403` (owner bukan pemilik): `{ "message": "Anda tidak memiliki izin untuk mengelola warung ini" }`.
- Error `404`: `{ "message": "Data warung tidak ditemukan" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `DELETE /api/v1/stalls/:id`

- Auth: wajib; role: `admin` saja.
- Path: `id` positive integer string; body/query tidak ada.
- Sukses `200`: `{ "status": "success", "data": { "id": 1, "ownerId": 2, "name": "Warung Bu Tini", "category": "Kwetiau", "location": "Kantin FKIP", "description": "Kedai kwetiau goreng & kuah", "avgRating": 4.5, "reviewCount": 2, "isPopular": false } }`.
- Error `400`: `{ "message": "Validasi input gagal", "errors": [{ "field": "id", "message": "Harus berupa integer" }] }`.
- Error `401`: `{ "message": "Token autentikasi diperlukan" }`.
- Error `403`: `{ "message": "Anda tidak memiliki izin untuk mengakses resource ini" }`.
- Error `404`: `{ "message": "Data warung tidak ditemukan" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `GET /api/v1/stalls/:id/menus`

- Auth: tidak diperlukan; role: public.
- Path: `id` positive integer string.
- Sukses `200`: `{ "status": "success", "data": [{ "id": 1, "stallId": 1, "name": "Kwetiau Goreng Spesial", "price": 15000, "isAvailable": true }] }`; warung tanpa menu mengembalikan array kosong.
- Error `400`: `{ "message": "Validasi input gagal", "errors": [{ "field": "id", "message": "Harus berupa integer" }] }`.
- Error `404`: `{ "message": "Data warung tidak ditemukan" }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `POST /api/v1/stalls/:id/reviews`

- Auth: wajib; role: seluruh role terautentikasi (`admin`, `owner`, `customer`).
- Path: `id` positive integer string.
- Body (strict): `rating: integer` (1-5), `comment?: string` (trim, maks. 1000). Review dibuat untuk user dari token; satu review per user per warung.
- Sukses `201`: `{ "status": "success", "data": { "id": 17, "stallId": 1, "userId": 4, "rating": 5, "comment": "Enak", "likeCount": 0, "createdAt": "2026-01-01T00:00:00.000Z" } }`.
- Error `400`: `{ "message": "Validasi input gagal", "errors": [{ "field": "rating", "message": "Terlalu kecil: diharapkan number menjadi >=1" }] }`.
- Error `401`: `{ "message": "Token autentikasi diperlukan" }`.
- Error `404`: `{ "message": "Data warung tidak ditemukan" }`.
- Error `409`: `{ "message": "Pengguna sudah memberikan review untuk warung ini", "errors": [{ "field": "stallId", "message": "Review untuk warung ini sudah pernah dibuat" }] }`.
- Error `500`: `{ "message": "Terjadi kesalahan internal pada server" }`.

### `GET /docs`

- Auth: tidak diperlukan; role: public.
- Query/path/body: tidak ada.
- Sukses: halaman Swagger UI dari `src/docs/swagger-output.json` (bukan JSON API response).

## Otorisasi Aktual

- `POST /stalls`: middleware memerlukan JWT dan role `owner` atau `admin`. `ownerId` tidak dibaca dari request; service menerima `user.id` dari token.
- `PUT /stalls/:id`: middleware memerlukan JWT dan role `admin` atau `owner`. Service membaca data warung lebih dahulu; jika bukan admin dan `existing.ownerId !== user.id`, ia mengembalikan `403`. Admin dapat mengubah warung siapa pun.
- `DELETE /stalls/:id`: middleware hanya menerima `admin`. Owner tidak dapat menghapus.
- Role lain tidak dapat melakukan create/update/delete. Backend tetap penjaga hak akses utama.
- Review memerlukan autentikasi, tetapi tidak membatasi role lebih lanjut.

## Temuan Integrasi dan Perbaikan

Temuan audit awal dan status:
- CORS dependency telah tersedia, tetapi belum aktif dan `CORS_ORIGIN` belum dipakai. **Diperbaiki:** middleware CORS dipasang sebelum parser dengan origin `CORS_ORIGIN` atau `http://localhost:5173`, dan mengizinkan `Authorization`/`Content-Type`.
- Password SQL literal muncul di README, `.env.example`, dan script SQL; `.env` lokal juga ditemukan. **Diperbaiki pada file yang di-commit:** credential literal diganti placeholder/SQLCMD variable; `.env` lokal tetap hanya diabaikan dan tidak boleh dikomit.
- Password SQL lama masih dapat ditemukan di riwayat commit meskipun sudah tidak ada pada file tracked saat ini. Rotasi password wajib dilakukan; pembersihan riwayat Git merupakan tindakan terpisah dan tidak dilakukan dalam perubahan ini.
- Seed SQL lama menggunakan `hash_*` yang bukan hash bcrypt. **Diperbaiki:** gunakan `npm run seed` yang hash-nya dibuat lewat bcrypt dari `SEED_PASSWORD`; seed SQL lama tidak lagi memasukkan akun palsu.

- Format error lama memasukkan `status: "fail"` dan selalu mengirim `errors: []`. **Diperbaiki:** semua error kini `{ message, errors? }`; setiap issue Zod tetap menyertakan `field` dan `message`.
- Script `typecheck`/`seed` belum tersedia. **Diperbaiki:** backend memiliki `npm run typecheck` dan `npm run seed`.
- Ignore rules dan referensi SQL sebelumnya berakar pada folder praktikum lama. **Diperbaiki:** SQL dipindahkan ke `backend/db`, ignore rules mencakup `.env`, `node_modules`, `dist`, dan swagger output.
- Tidak ada endpoint review-list; integrasi frontend untuk review hanya bisa membuat review. Tidak ada endpoint logout server-side; JWT bersifat stateless dan logout dilakukan dengan menghapus token di client.

## Prioritas Perbaikan

1. Pastikan konfigurasi lokal rahasia tidak di-commit dan ganti password SQL Server lokal jika pernah dipublikasikan.
2. Jalankan SQL setup, seed bcrypt, lalu uji login dan `GET /auth/me` terhadap SQL Server yang aktif.
3. Jalankan skenario akses per role dari `docs/TEST_SCENARIOS.md`; UI menyamarkan aksi, backend tetap otorisasi.
