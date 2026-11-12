# Skenario Pengujian Manual

Sebelum mulai, jalankan SQL Server, setup schema, isi `backend/.env`, jalankan `npm run seed` dan `npm run dev` di `backend`, lalu jalankan `npm run dev` di `frontend`. Password akun seed adalah nilai lokal `SEED_PASSWORD`.

## 1. Daftar Warung

- Langkah: buka `/`, tunggu data selesai dimuat.
- Hasil: daftar berasal dari `GET /api/v1/stalls`, tampil dengan kategori, rating, lokasi, dan jumlah ulasan.
- Bukti: screenshot UI dan Network request `GET /api/v1/stalls` berstatus 200.

## 2. Detail Warung

- Langkah: pilih kartu warung lalu buka detailnya.
- Hasil: detail berasal dari `GET /api/v1/stalls/:id`; informasi menu diambil dari endpoint menus yang tersedia.
- Bukti: screenshot halaman detail serta Network request detail dan menus berstatus 200.

## 3. Admin CRUD

- Langkah: login sebagai `admin@example.test`; tambah warung, ubah nama/deskripsi, lalu hapus melalui dialog konfirmasi.
- Hasil: POST, PUT, dan DELETE berhasil; daftar dimuat ulang dari backend setelah penghapusan.
- Bukti: screenshot setiap hasil UI, Network request CRUD berstatus sukses, serta perubahan tabel `STALLS` di database.

## 4. Owner Membuat dan Mengubah Milik Sendiri

- Langkah: login sebagai `owner1@example.test`; buat warung, buka warung miliknya, lalu ubah salah satu field.
- Hasil: POST dan PUT berhasil; `ownerId` berasal dari token dan tidak dikirim frontend dalam body.
- Bukti: screenshot form/detail, Network request tanpa `ownerId`/role pada body, serta baris warung dengan owner yang sesuai di `STALLS`.

## 5. Owner Tidak Dapat Mengubah Warung Owner Lain

- Langkah: sebagai owner 1, buka URL edit warung owner 2 secara langsung; bila perlu uji `PUT /api/v1/stalls/:id` dengan token owner 1.
- Hasil: tombol edit tidak tampil pada kartu owner lain; halaman/endpoint menolak dengan 403.
- Bukti: screenshot UI dan Network 403; pastikan data warung owner 2 tidak berubah di `STALLS`.

## 6. Owner Tidak Dapat Menghapus

- Langkah: login sebagai owner, periksa kartu warung sendiri dan kirim DELETE secara manual melalui REST client.
- Hasil: tombol hapus tidak tampil dan backend menolak DELETE dengan 403.
- Bukti: screenshot kartu tanpa tombol hapus serta Network/REST client 403.

## 7. Register dan Login

- Langkah: daftarkan email baru dengan nama, email, password valid; lalu login dengan akun tersebut.
- Hasil: register mengembalikan 201 dan role customer; login mengembalikan token dan user.
- Bukti: screenshot kedua form, Network POST register/login, dan tanpa menampilkan nilai password/token di screenshot publik.

## 8. Informasi Pengguna `/auth/me`

- Langkah: login sebagai customer atau admin, lalu buka `/profile`.
- Hasil: nama, email, role, dan ID berasal dari `GET /api/v1/auth/me`.
- Bukti: screenshot profil dan Network GET `/auth/me` berstatus 200 dengan header Bearer tersamarkan.

## 9. Akses Terlindungi Tanpa Login

- Langkah: logout/bersihkan sesi lalu buka `/profile`, `/stalls/new`, dan `/stalls/:id/edit`.
- Hasil: diarahkan ke `/login`; setelah login, pengguna kembali ke tujuan awal bila akses role diizinkan.
- Bukti: screenshot redirect dan Network request terlindungi tidak mengirim token.

## 10. Penanganan 401 dan 403

- Langkah: gunakan token kadaluarsa/tidak valid untuk request terlindungi; lalu login sebagai customer dan coba POST `/stalls` atau owner dan coba DELETE.
- Hasil: 401 pada halaman terlindungi membersihkan token dan mengarahkan ke `/login` dengan pesan "Sesi berakhir. Silakan login kembali." Pada halaman publik, halaman tetap terbuka dan token tidak valid hanya dibersihkan. 403 menampilkan pesan tidak punya akses tanpa menghapus sesi.
- Bukti: screenshot pesan UI dan Network status 401/403; redaksi nilai Authorization.

## 11. Loading, Empty, dan Error State

- Langkah: amati skeleton saat daftar memuat; gunakan query yang tidak menghasilkan data; hentikan backend sementara untuk memicu error; kirim form dan amati status proses.
- Hasil: loading, empty (daftar kosong berbeda dari filter kosong), error dengan tombol coba lagi, dan tombol submit disabled/proses terlihat.
- Bukti: screenshot setiap state; Network request terkait.

## 12. Bukti Data Tersimpan di Database

- Langkah: sebagai admin/owner sesuai hak akses, buat atau ubah warung; jalankan query SQL `SELECT id, owner_id, name, category, location FROM dbo.STALLS ORDER BY id DESC`.
- Hasil: nilai yang ditampilkan frontend cocok dengan baris SQL Server; hapus admin menghilangkan baris tersebut.
- Bukti: screenshot UI, Network response sukses, serta hasil query database setelah operasi.