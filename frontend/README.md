# Ngantin Sayang Frontend

Frontend Sistem Review Kantin untuk menjelajahi warung dan mengelola data sesuai role pengguna. Semua komunikasi HTTP menggunakan Axios ke REST API Express.

## Teknologi

- React 19 dan TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios

## Prasyarat

- Node.js 22.18 atau lebih baru
- npm
- Backend aktif dan CORS backend mengizinkan `http://localhost:5173`

## Konfigurasi dan Menjalankan

Salin `.env.example` menjadi `.env`:

```sh
cp .env.example .env
```

Atur `VITE_API_BASE_URL` ke base URL API backend, misalnya `http://localhost:3000/api/v1`. Jangan menaruh secret backend di environment frontend.

```sh
npm install
npm run dev
```

Perintah pemeriksaan:

```sh
npm run build
npm run lint
```

Vite berjalan di `http://localhost:5173` secara default.

## Halaman dan Akses

| Rute | Akses |
| --- | --- |
| `/` | Public: daftar, pencarian, filter, pagination; aksi kelola menyesuaikan role/ownership |
| `/stalls/:id` | Public: detail warung dan menu |
| `/login` | Public |
| `/register` | Public; akun baru menjadi customer |
| `/profile` | Pengguna yang sudah login |
| `/stalls/new` | Owner dan admin |
| `/stalls/:id/edit` | Owner dan admin; owner hanya warung miliknya |
| `*` | Halaman tidak ditemukan |

Customer/public hanya dapat melihat daftar dan detail. Admin dapat membuat, mengubah, dan menghapus; owner dapat membuat dan mengubah warung miliknya. Backend tetap menjadi penjaga utama otorisasi.

## Autentikasi

JWT disimpan di `localStorage` browser. Axios request interceptor mengirim `Authorization: Bearer <token>`. Saat aplikasi dimuat, frontend memanggil `GET /auth/me` sekali untuk memulihkan sesi. Respons 401 di luar request login/register menghapus token dan memberi tahu AuthContext; halaman terlindungi mengarahkan ke login. Respons 403 ditampilkan sebagai pesan tidak punya akses tanpa menghapus sesi.

## Struktur Folder

```text
src/
  api/          Axios client dan layanan auth/stalls
  components/   Navbar, form field, state, dialog, toast, kartu
  context/      Auth dan notifikasi
  hooks/        useAuth dan useToast
  pages/        Daftar, detail, form, login, register, profil
  routes/       Router dan ProtectedRoute
  types/        Tipe kontrak API
  utils/        Validasi ID URL
```
