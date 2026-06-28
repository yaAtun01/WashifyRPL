# Phase 4: Maintenance & Panduan Instalasi (Washify)

Dokumen ini memuat panduan instalasi, konfigurasi, running server, serta perawatan sistem **Washify - Admin Laundry Management System**.

---

## 1. Prasyarat Sistem (Prerequisites)
Sebelum menjalankan sistem, pastikan perangkat Anda telah terpasang:
* **Python**: Versi 3.8 ke atas (Direkomendasikan 3.10 atau 3.11).
* **Node.js**: Versi 18 ke atas (beserta npm).
* **PostgreSQL Database Server**: Versi 13 ke atas.

---

## 2. Persiapan Database
1. Buka PostgreSQL GUI client (seperti pgAdmin atau DBeaver) atau psql CLI.
2. Buat database baru bernama `washify_db`:
   ```sql
   CREATE DATABASE washify_db;
   ```
3. Import file `schema.sql` untuk membuat struktur tabel:
   ```bash
   psql -U username -d washify_db -f schema.sql
   ```
4. Import file `data.sql` untuk menyuntikkan data dummy historis 10 hari dan akun default admin:
   ```bash
   psql -U username -d washify_db -f data.sql
   ```

---

## 3. Instalasi & Konfigurasi Backend (FastAPI)
1. Buka terminal pada direktori `backend/`.
2. (Opsional) Buat virtual environment agar dependensi terisolasi:
   ```bash
   python -m venv venv
   # Mengaktifkan venv di Windows:
   venv\Scripts\activate
   # Mengaktifkan venv di macOS/Linux:
   source venv/bin/activate
   ```
3. Install semua dependensi Python:
   ```bash
   pip install -r requirements.txt
   ```
4. Edit konfigurasi database di file `backend/app/config.py` atau definisikan environment variable:
   * **Database URL**: `DATABASE_URL=postgresql://postgres:password@localhost:5402/washify_db` (Sesuaikan username, password, port, dan db name Anda).
   * **JWT Secret**: `SECRET_KEY=kunci_rahasia_anda_di_sini`
5. Jalankan server backend menggunakan Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```
   * Server backend akan aktif di alamat: `http://127.0.0.1:8000`
   * Dokumentasi Swagger API dapat diakses di: `http://127.0.0.1:8000/docs`

---

## 4. Instalasi & Konfigurasi Frontend (React Vite)
1. Buka terminal pada direktori `frontend/`.
2. Install modul dependensi Node.js:
   ```bash
   npm install
   ```
3. Konfigurasi file `.env` (jika diperlukan untuk production):
   * `VITE_API_URL=http://127.0.0.1:8000` (Sudah terdefinisi secara default di dalam kode axios client).
4. Jalankan dev server lokal:
   ```bash
   npm run dev
   ```
   * Aplikasi frontend akan berjalan di alamat: `http://127.0.0.1:5173` (atau bind loopback `http://127.0.0.1:5173`).

---

## 5. Menjalankan Workspace Secara Cepat (Root Helper)
Jika Anda berada di root folder proyek `ProjectRPL/`, kami telah menyediakan helper `package.json` untuk menjalankan front-end/back-end secara mudah:
* **Install dependensi serentak**: `npm run install:all`
* **Jalankan frontend**: `npm run dev:frontend`
* **Jalankan backend**: `npm run dev:backend`

---

## 6. Prosedur Pemeliharaan (Maintenance)

### A. Pengaturan Akun Admin Tambahan
Akun admin pertama dibuat menggunakan query `data.sql` (`admin@washify.com` / `admin123`). Untuk memelihara/mengubah password, Anda dapat menggunakan hashing BCrypt melalui script helper Python:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_pwd = pwd_context.hash("password_baru_anda")
print(hashed_pwd)
```
Kemudian lakukan query `UPDATE users SET password = 'hashed_pwd' WHERE email = 'admin@washify.com';`.

### B. Backup & Restore Database Berkala
* **Backup**:
  ```bash
  pg_dump -U postgres -d washify_db > backup_washify_tanggal.sql
  ```
* **Restore**:
  ```bash
  psql -U postgres -d washify_db < backup_washify_tanggal.sql
  ```
