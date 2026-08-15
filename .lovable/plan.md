# Perbaiki Halaman Kosong pada Hasil Export Static

## Penyebab yang sudah dipastikan

Saya membongkar `public/exports/remindly-static.zip` dan memeriksa hasilnya:

1. **Root route memakai "shell" HTML penuh.** `src/routes/__root.tsx` punya `shellComponent` yang merender `<html><head>…</head><body>{children}<Scripts /></body></html>`. Itu benar untuk versi SSR di Lovable, tetapi pada build statis komponen tersebut ikut dirender di dalam `<div id="root">`, sehingga struktur jadi `html di dalam body` dan isi aplikasi tidak pernah tampil. `<Scripts />` juga tidak punya konteks server di mode statis. Ini penyebab utama layar kosong.
2. **Semua aset memakai path absolut** (`/assets/index-…js`). Kalau situs diunggah ke subfolder (mis. `domain.com/app/`), berkas JS tidak ditemukan dan halaman tetap kosong.
3. **Validasi ekspor saat ini tidak pernah membuka halaman**, jadi 10 pemeriksaan bisa lulus semua walaupun aplikasi blank.

## Yang akan diperbaiki

### 1. Shell khusus build statis
- Tambahkan file root khusus SPA yang memakai `Route`/komponen yang sama tetapi shell-nya hanya meneruskan `{children}` (tanpa `<html>`, `<head>`, `<Scripts />`).
- `spa/vite.config.ts` mengalihkan (alias) `src/routes/__root.tsx` ke file tersebut hanya saat build statis, sehingga versi Lovable/SSR tidak berubah sedikit pun.
- Judul dan meta tetap ada karena sudah ditulis langsung di `spa/index.html`.

### 2. Path aset relatif
- Set `base: "./"` pada build statis agar `index.html`, `404.html`, dan aset bekerja baik di root domain maupun di subfolder.
- Rewrite fallback `404.html` mengikuti perubahan ini.

### 3. Validasi yang benar-benar membuka halaman
Tambahan pemeriksaan pada `scripts/export-static.mjs`:
- **Render check**: menjalankan server statis lokal sementara, membuka `index.html` dengan browser headless, lalu memastikan `#root` terisi (ada teks/elemen) dan tidak ada error konsol yang fatal.
- **Shell check**: memastikan bundel tidak lagi mengandung tag `<html>`/`Scripts` dari shell SSR.
- **Base check**: memastikan aset direferensikan relatif (`./assets/...`), bukan absolut.
- ZIP tetap hanya dibuat bila semua pemeriksaan lulus, dan halaman **Export** menampilkan hasil pemeriksaan baru ini.

### 4. Panduan deploy diperbarui
- `scripts/deploy-guide.md` dan halaman `/export` diberi catatan singkat: paket bisa dipasang di root domain maupun subfolder, aturan rewrite ke `index.html` tetap wajib, dan halaman login butuh HTTPS.

## Catatan teknis
- Tidak ada perubahan logika data, SMTP, maupun backend; hanya konfigurasi build statis, root shell khusus SPA, dan skrip validasi.
- Setelah perbaikan, jalankan ulang `npm run export:static` agar ZIP di halaman Export tergantikan versi yang sudah teruji render.
