# Phase 3: Rencana Pengujian & Blackbox Testing (Washify)

Dokumen ini memuat skenario pengujian fungsionalitas sistem **Washify** menggunakan metode **Blackbox Testing** (menguji fungsionalitas tanpa harus mengetahui struktur internal kode).

---

## 1. Skenario Pengujian Fungsional

### 1. Modul Autentikasi Admin (FR-01)
| ID Pengujian | Prosedur Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **TC-ATH-01** | Masukkan email salah atau password kurang dari 6 karakter. Klik login. | Muncul validasi email error / password minimal 6 karakter langsung di form. | PASS |
| **TC-ATH-02** | Masukkan email `admin@washify.com` dan password `salahpassword`. Klik login. | Server mengembalikan HTTP 401. Tampil alert "Login failed. Silakan periksa kredensial Anda." | PASS |
| **TC-ATH-03** | Centang "Ingat saya...", masukkan email `admin@washify.com` & password `admin123`. Klik login. | Login berhasil, redirect ke dashboard. Pada pemuatan ulang browser, email terisi otomatis. | PASS |
| **TC-ATH-04** | Akses langsung `/admin/dashboard` tanpa login (tanpa token). | Sistem menolak akses dan me-redirect paksa kasir ke halaman `/login`. | PASS |

---

### 2. Modul Manajemen Pelanggan & Layanan (FR-02, FR-03)
| ID Pengujian | Prosedur Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **TC-CST-01** | Daftarkan pelanggan baru dengan formulir lengkap. | Pelanggan tersimpan ke database, muncul toast sukses, dan list pelanggan bertambah. | PASS |
| **TC-SVC-01** | Tambahkan layanan baru dengan harga per kg Rp 8,000. | Layanan berhasil tersimpan dan tampil di pilihan order transaksi baru. | PASS |
| **TC-SVC-02** | Ubah status paket layanan menjadi NON-AKTIF (*inactive*). | Paket tersebut otomatis disembunyikan dari dropdown input transaksi baru. | PASS |

---

### 3. Modul Manajemen Transaksi & Cetak Nota (FR-04, FR-05, FR-06, FR-07, FR-08)
| ID Pengujian | Prosedur Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **TC-TRX-01** | Buat transaksi baru. Pilih pelanggan, paket Rp 6,000, berat 3.5 Kg. Klik Simpan. | Estimasi harga berubah dinamis (Rp 21,000). Transaksi tersimpan. | PASS |
| **TC-TRX-02** | Periksa nomor nota transaksi pertama pada hari tersebut. | Kode nota bernilai `WSF-YYYYMMDD-0001`. | PASS |
| **TC-TRX-03** | Tambah transaksi kedua pada hari yang sama. | Nomor nota bertambah secara sekuensial menjadi `WSF-YYYYMMDD-0002`. | PASS |
| **TC-TRX-04** | Ubah status cucian menjadi `SUDAH DIAMBIL` (*selesai*). | Status cucian terupdate, dan `finish_date` terisi otomatis tanggal hari ini di database. | PASS |
| **TC-TRX-05** | Klik tombol "Cetak Nota" pada tabel transaksi. | Tampil modal layout struk lengkap dengan detail harga, catatan, dan QR Code. | PASS |
| **TC-TRX-06** | Klik tombol "Cetak Nota / Save PDF" pada struk. | Browser membuka jendela print default sistem operasi (ramah kertas thermal). | PASS |

---

### 4. Modul Laporan & Analitik Prediksi (FR-09, FR-10, FR-11)
| ID Pengujian | Prosedur Uji | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| **TC-REP-01** | Buka halaman Laporan Keuangan, ubah rentang tanggal, klik apply. | Grafik pendapatan harian ter-update sesuai rentang tanggal pilihan. | PASS |
| **TC-PRD-01** | Buka halaman Prediksi Pendapatan saat data transaksi lunas kurang dari 3 hari berbeda. | Tampil banner warning: "Data transaksi belum cukup... Minimal dibutuhkan 3 hari berbeda." | PASS |
| **TC-PRD-02** | Jalankan prediksi saat database memiliki data sebaran transaksi lunas selama 10 hari berturut-turut. | Kartu 7 hari dan 30 hari menampilkan nilai proyeksi nominal IDR. Grafik menampilkan garis tren oranye. | PASS |
| **TC-THM-01** | Klik tombol "Dark Mode / Light Mode" di bagian bawah sidebar. | Tampilan berganti gelap/terang secara mulus, status disimpan di browser local storage. | PASS |
