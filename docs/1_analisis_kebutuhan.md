# Phase 1: Analisis Kebutuhan Sistem (Washify)

Dokumen ini mendefinisikan ruang lingkup dan analisis kebutuhan sistem dari aplikasi **Washify - Admin Laundry Management System**. Sistem ini dirancang untuk mendigitalisasi proses operasional pada outlet laundry yang sebelumnya berjalan manual.

---

## 1. Identifikasi Masalah
Pencatatan transaksi laundry secara manual (menggunakan buku fisik) memicu beberapa hambatan:
1. **Kesalahan Pencatatan**: Salah hitung berat cucian, tertukarnya data pelanggan, atau hilangnya salinan nota fisik.
2. **Keterlambatan Pelacakan**: Sulit memantau cucian mana yang sedang dicuci, disetrika, atau siap diambil.
3. **Lambatnya Pelaporan**: Rekapitulasi omset harian/bulanan membutuhkan waktu lama karena harus menjumlahkan nota satu per satu.
4. **Tidak Ada Proyeksi Bisnis**: Pengelola tidak memiliki representasi data/grafik tren pendapatan untuk memproyeksikan omset ke depan.

---

## 2. Solusi & Tujuan Sistem
Sistem **Washify** hadir sebagai platform manajemen internal (Admin-Only) untuk:
* Mengganti pencatatan manual menjadi digital, andal, dan minim eror.
* Mempercepat pencatatan order baru dengan kalkulasi harga otomatis.
* Memfasilitasi pelacakan status cucian dan pembayaran secara real-time.
* Menghasilkan laporan pendapatan berkala (harian, mingguan, bulanan) otomatis beserta grafik visual yang menarik.
* Menyediakan fitur analitik berbasis kecerdasan buatan sederhana (Linear Regression) untuk memprediksi omset laundry di masa mendatang.

---

## 3. Batasan Sistem (Scope)
Sesuai rancangan Waterfall SDLC yang disepakati:
1. **Single-Role (Admin-Only)**: Aplikasi ini hanya diakses oleh pemilik outlet / kasir laundry (Admin). Tidak ada sistem registrasi publik, portal tracking customer, atau area khusus customer.
2. **Konektivitas Lokal**: Dirancang berjalan secara responsif di area internal outlet, terhubung ke database PostgreSQL pusat.
3. **Fitur Pelacakan Non-Publik**: QR Code pada nota mengarah pada URL representasi nota lokal (print preview) demi validasi cepat kasir.

---

## 4. Kebutuhan Fungsional (Functional Requirements)

| Kode | Kebutuhan Fungsional | Deskripsi |
| :--- | :--- | :--- |
| **FR-01** | Autentikasi Admin | Kasir/Admin dapat login menggunakan email dan password bawaan (`admin@washify.com` / `admin123`). Dilengkapi fitur "Remember Me" dan proteksi rute (JWT Token). |
| **FR-02** | Manajemen Pelanggan (CRUD) | Mengelola data pelanggan meliputi Nama, Email, No. HP, dan Alamat. |
| **FR-03** | Manajemen Layanan (CRUD) | Mengatur paket laundry (cth: Cuci Kering, Cuci Setrika) beserta harga per kg dan status keaktifan paket (active/inactive). |
| **FR-04** | Pencatatan Transaksi Baru | Mendaftarkan order laundry dengan memilih pelanggan, paket layanan, berat (kg), status bayar, dan catatan khusus (*notes*). Harga total dihitung otomatis. |
| **FR-05** | Kode Nota Berurutan Harian | Nomor nota digenerate otomatis dengan format serial berurutan harian: `WSF-YYYYMMDD-0001` (berulang dari 0001 setiap hari baru). |
| **FR-06** | Pembaruan Status Cucian | Admin dapat memperbarui status cucian secara cepat (*Diterima, Dicuci, Disetrika, Siap Diambil, Sudah Diambil*). |
| **FR-07** | Pelunasan & Metode Pembayaran | Mengubah status pembayaran (*Belum Bayar / Lunas*) dan memilih metode (*Cash, Transfer, E-Wallet*). |
| **FR-08** | Cetak Nota Otomatis | Menyediakan tampilan cetak nota ramah printer/PDF yang dilengkapi QR Code pelacakan internal. |
| **FR-09** | Dashboard Interaktif | Menampilkan 11 metrik ringkasan (pelanggan, transaksi, status aktif, pendapatan) dan chart distribusi status laundry (Chart.js). |
| **FR-10** | Laporan Keuangan | Menghasilkan laporan omset berdasarkan rentang tanggal pilihan kasir lengkap dengan grafik batang harian. |
| **FR-11** | Prediksi Pendapatan (AI) | Memproyeksikan omset lunas laundry untuk 7 dan 30 hari ke depan menggunakan regresi linear. Menampilkan banner warning jika data history < 3 hari. |

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Keamanan (Security)**:
   * Password admin dienkripsi menggunakan hashing BCrypt di database.
   * Pertukaran API diamankan menggunakan Bearer JSON Web Token (JWT) dengan durasi kedaluwarsa.
2. **Usabilitas (Usability)**:
   * Antarmuka modern, intuitif, dan responsif (nyaman diakses lewat smartphone kasir maupun PC outlet).
   * Dilengkapi Toggle Tema (Light Mode / Dark Mode) yang disimpan secara persisten di penyimpanan browser lokal.
3. **Kinerja (Performance)**:
   * Halaman login memiliki layar loading visual transisi (splash screen washing machine) agar terkesan premium.
   * Query database teroptimasi dengan indeks pada foreign key transaksi.
