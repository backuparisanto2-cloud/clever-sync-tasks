# Halaman Env: salin, unduh, dan pilih port SMTP/TLS

## Kondisi saat ini
Halaman **Env** sudah punya tombol salin per variabel dan tombol **Salin isi .env** / **Unduh .env**. Yang belum ada: pemilihan port SMTP dan mode TLS, sehingga nilai SMTP belum ikut tersusun di panduan.

## Yang akan ditambahkan

1. **Pemilih koneksi SMTP** di bagian atas halaman Env:
   - Pilihan mode: `465 — TLS langsung (SMTPS)`, `587 — STARTTLS`, `25 — tanpa enkripsi`, dan `Port khusus` (isi angka sendiri + sakelar TLS).
   - Kolom host SMTP opsional (mis. `smtp.gmail.com`) dan alamat pengirim opsional.

2. **Variabel baru tersusun otomatis** mengikuti pilihan di atas, muncul di daftar variabel backend dan di isi file `.env`:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (true/false), `SMTP_FROM`
   - Diberi label "server" dengan catatan bahwa password SMTP tidak boleh masuk bundel statis.

3. **Tombol salin & unduh diperjelas**
   - Tombol salin di setiap baris variabel tetap ada, termasuk untuk variabel SMTP baru.
   - Satu tombol "Salin semua" untuk seluruh blok, dan tombol unduh menghasilkan `.env` berisi variabel build (VITE_*) plus blok komentar variabel backend/SMTP agar jelas mana yang diisi di server.

4. **Catatan bantuan singkat** di bawah pemilih: penjelasan kapan memakai 465 vs 587, dan pengingat bahwa nilai ini harus cocok dengan profil SMTP di halaman SMTP.

## Catatan teknis
- Perubahan hanya di `src/routes/env-guide.tsx` (state lokal untuk mode port/host/from, penambahan entri pada daftar `vars`, dan penyusunan teks `.env`).
- Tidak ada perubahan backend, database, atau logika pengiriman email.
