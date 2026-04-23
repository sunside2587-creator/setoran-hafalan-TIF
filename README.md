# Web Setoran Hafalan

Project ini dibuat dengan Vue 3, Vue Router, Vite, dan Bootstrap 5.

## Fitur

- Login menggunakan endpoint Keycloak pada koleksi Postman.
- Dashboard dosen PA berisi ringkasan dan daftar mahasiswa.
- Halaman detail mahasiswa untuk melihat progres setoran, riwayat log, validasi setoran baru, dan pembatalan setoran.
- Routing per halaman dengan proteksi route sederhana berbasis token.

## Menjalankan project

1. Install dependency:

```bash
npm install
```

2. Copy file environment:

```bash
copy .env.example .env
```

3. Isi nilai `VITE_API_KEY` dan `VITE_KC_CLIENT_SECRET` pada `.env`.

4. Jalankan:

```bash
npm run dev
```

## Catatan

- Semua request API bisnis akan menambahkan `apikey` pada query string dan `Authorization: Bearer <token>` pada header.
- Flow login mengikuti koleksi Postman yang memakai password grant. Untuk production, flow ini sebaiknya dipindahkan ke backend agar `client_secret` tidak terekspos di browser.
