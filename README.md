# Washify - Admin Laundry Management System 🧼

**Washify** adalah aplikasi website *Laundry Management System* modern dan responsif yang dirancang secara khusus untuk **Admin/Kasir Laundry**. Aplikasi ini menyederhanakan pencatatan manual menjadi digital, mempercepat pencatatan transaksi, melacak status cucian/pembayaran secara real-time, mengelola data pelanggan & paket layanan, serta menyajikan analitik laporan keuangan harian dan proyeksi pendapatan (AI) menggunakan metode **Linear Regression**.

Sistem ini dikembangkan menggunakan metode rekayasa perangkat lunak **Waterfall (SDLC)**.

---

## 🛠️ Teknologi yang Digunakan

### Frontend
* **React.js (Vite)**
* **Tailwind CSS**
* **Axios** (konektivitas API)
* **React Router DOM** (routing SPA)
* **Chart.js** (grafik rekapitulasi & proyeksi)
* **React Icons** (ikon antarmuka)
* **Framer Motion** (animasi transisi)
* **QR Code Generator** (nota digital kasir)

### Backend
* **Python (FastAPI)**
* **SQLAlchemy** (Object Relational Mapper)
* **Pydantic** (data validation)
* **Passlib (BCrypt)** (keamanan password)
* **JWT (JSON Web Tokens)** (autentikasi stateless)
* **Uvicorn** (ASGI server)

### Database
* **PostgreSQL** (`washify_db`)

---

## 📁 Struktur Folder Project

```text
ProjectRPL/
│
├── backend/               # Python FastAPI backend service
│   ├── app/
│   │   ├── routers/       # API endpoints (auth, orders, reports, predictions, etc.)
│   │   ├── config.py      # Environment configurations
│   │   ├── database.py    # Database connection builder
│   │   ├── models.py      # SQLAlchemy models mapping PostgreSQL tables
│   │   ├── schemas.py     # Pydantic request/response validators
│   │   └── main.py        # FastAPI app initialization and middleware config
│   └── requirements.txt   # Python dependency list
│
├── frontend/              # React.js Vite frontend web application
│   ├── src/
│   │   ├── context/       # Auth (JWT) & Theme Contexts
│   │   ├── layouts/       # SidebarLayout wrapper
│   │   ├── pages/         # Login & Admin Page modules (Customers, Transactions, Reports, etc.)
│   │   ├── services/      # Axios API configuration
│   │   ├── index.css      # Core Tailwind styling & custom machine/bubble animations
│   │   └── main.jsx       # Vite React entry mount
│   ├── package.json       # Node dependency list
│   └── tailwind.config.js # Custom theme colors mapping light Mode vs dark Mode
│
├── docs/                  # Waterfall SDLC Stage Documentation
│   ├── 1_analisis_kebutuhan.md
│   ├── 2_desain_sistem.md
│   ├── 3_testing.md
│   └── 4_maintenance.md
│
├── schema.sql             # Skema Pembuatan Tabel Database
├── data.sql               # Seed Data Historis & Akun Default Kasir
├── package.json           # Root workspace helper scripts
└── README.md              # Project manual (Dokumen ini)
```

---

## ⚙️ Cara Menjalankan Sistem Secara Cepat

Pastikan PostgreSQL telah aktif dengan database bernama `washify_db`, lalu ikuti 3 langkah berikut:

### 1. Inisialisasi Database
Jalankan dump query `schema.sql` dan `data.sql` pada PostgreSQL database server Anda untuk membuat tabel dan data dummy 10 hari.

### 2. Jalankan Perintah Instalasi
Dari root folder `ProjectRPL/`, jalankan instalasi serentak dependensi Python & Node.js:
```bash
npm run install:all
```

### 3. Jalankan Aplikasi (Dev Mode)
Jalankan dev runner secara bersamaan di terminal terpisah:
* **Terminal 1 (Backend FastAPI)**:
  ```bash
  npm run dev:backend
  ```
* **Terminal 2 (Frontend React)**:
  ```bash
  npm run dev:frontend
  ```

Akses frontend pada browser Anda di: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🔑 Kredensial Default Admin
* **Email**: `admin@washify.com`
* **Password**: `admin123`

---

## 📚 Tautan Dokumentasi SDLC
Silakan tinjau tahapan Waterfall SDLC pada berkas berikut:
1. **Analisis Kebutuhan**: [1_analisis_kebutuhan.md](file:///c:/KUMPULAN%20SMT%204/KUMPULAN%20TUGAS%20MATKUL/ProjectRPL/docs/1_analisis_kebutuhan.md)
2. **Desain UML & ERD**: [2_desain_sistem.md](file:///c:/KUMPULAN%20SMT%204/KUMPULAN%20TUGAS%20MATKUL/ProjectRPL/docs/2_desain_sistem.md)
3. **Pengujian Blackbox**: [3_testing.md](file:///c:/KUMPULAN%20SMT%204/KUMPULAN%20TUGAS%20MATKUL/ProjectRPL/docs/3_testing.md)
4. **Panduan Pemeliharaan**: [4_maintenance.md](file:///c:/KUMPULAN%20SMT%204/KUMPULAN%20TUGAS%20MATKUL/ProjectRPL/docs/4_maintenance.md)
