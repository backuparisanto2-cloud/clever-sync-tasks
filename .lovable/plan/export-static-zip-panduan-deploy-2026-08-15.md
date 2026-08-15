# Export Static (ZIP) + Panduan Deploy

## Tujuan
Menyediakan tombol untuk mengunduh versi statis aplikasi (HTML/CSS/JS) dalam satu file ZIP, yang bisa diunggah ke hosting biasa (cPanel, Netlify, Vercel static, Nginx) sementara database, auth, dan storage tetap memakai backend Lovable Cloud yang sekarang.

Catatan: format RAR tidak bisa dibuat secara legal/otomatis (butuh WinRAR berlisensi). Ekspor memakai ZIP, yang bisa dibuka semua sistem.

## Yang akan dibangun

### 1. Skrip build statis
- Skrip `scripts/export-static.mjs` yang menjalankan build SPA (tanpa SSR) dari kode yang sama, lalu:
  - menambahkan `index.html` fallback untuk semua rute (SPA routing),
  - menambahkan `.htaccess`, `_redirects`, dan contoh konfigurasi Nginx supaya refresh halaman tidak 404,
  - menyertakan `README-DEPLOY.md` di dalam ZIP,
  - membungkus hasilnya menjadi `public/exports/remindly-static.zip`.
- Kredensial backend (URL + publishable key) di-inject saat build, jadi bundel statis langsung terhubung ke database yang sama.
- Pengiriman email tetap lewat backend Lovable (butuh soket SMTP), diarahkan lewat `VITE_BACKEND_URL` yang sudah ada di `src/lib/backend.ts`.

### 2. Halaman "Export static" di aplikasi
- Rute baru `/export` (masuk menu di AppShell).
- Isi halaman:
  - Tombol **Unduh ZIP statis** (mengunduh file yang sudah tersedia di `public/exports/`), lengkap dengan ukuran file dan tanggal build.
  - Panduan deploy langkah demi langkah yang ditampilkan langsung di halaman: upload ke hosting, atur rewrite ke `index.html`, wajib HTTPS, dan cara memastikan CORS/backend email tetap jalan.
  - Blok "hal yang tetap butuh backend": pengiriman SMTP dan cron pengirim otomatis tetap berjalan di Lovable Cloud; jika Anda mematikan proyek Lovable, penjadwalan otomatis ikut berhenti.

### 3. Panduan deploy
File `README-DEPLOY.md` (ikut di dalam ZIP dan ditampilkan di halaman `/export`) berisi:
- Ekstrak ZIP, unggah seluruh isi folder ke `public_html` / root domain.
- Konfigurasi rewrite per jenis server (Apache `.htaccess`, Nginx `try_files`, Netlify `_redirects`).
- Menambahkan domain baru ke daftar CORS backend email agar tombol "Kirim" tidak diblokir browser.
- Cara membuat akun login dan mengisi profil SMTP setelah deploy.
- Catatan keamanan: publishable key aman di sisi klien karena akses data dilindungi RLS; password SMTP tidak pernah dikirim ke browser.

## Detail teknis
- Build statis memakai mode SPA Vite (`prerender`/shell dinonaktifkan) sehingga tidak ada worker/SSR yang perlu di-host.
- Semua akses data sudah berjalan dari browser via `src/lib/app.functions.ts`, jadi tidak ada perubahan logika data.
- ZIP dibuat saat skrip dijalankan dan disimpan sebagai aset publik agar tombol unduh bekerja di preview maupun setelah publish; skrip bisa dijalankan ulang kapan pun untuk menyegarkan hasil ekspor.
- Endpoint `/api/public/mail/*` perlu mengizinkan origin domain baru (opsi env `ALLOWED_ORIGINS`, default tetap mengizinkan seperti sekarang).
