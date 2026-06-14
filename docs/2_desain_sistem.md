# Phase 2: Desain Sistem & UML Diagrams (Washify)

Dokumen ini mendokumentasikan pemodelan arsitektur perangkat lunak **Washify** menggunakan spesifikasi diagram UML (Unified Modeling Language) berbasis Mermaid.

---

## 1. Use Case Diagram
Menggambarkan interaksi aktor tunggal (**Admin**) terhadap fungsi-fungsi utama sistem Washify.

```mermaid
usecaseDiagram
    actor Admin
    
    Admin --> (Login & Kelola Sesi)
    Admin --> (CRUD Data Pelanggan)
    Admin --> (CRUD Paket Layanan)
    Admin --> (Pencatatan Transaksi & Auto Nota)
    Admin --> (Update Status Cucian & Bayar)
    Admin --> (Cetak Nota dengan QR Code)
    Admin --> (Melihat Laporan Omset Harian)
    Admin --> (Melihat Analisis Prediksi Linear Regression)
```

---

## 2. Activity Diagram (Alur Transaksi Baru)
Menggambarkan alur aktivitas kasir/admin saat membuat pencatatan transaksi laundry baru.

```mermaid
stateDiagram-v2
    [*] --> BukaMenuTransaksi
    BukaMenuTransaksi --> KlikTambahTransaksi
    KlikTambahTransaksi --> PilihPelanggan
    PilihPelanggan --> PilihLayanan
    PilihLayanan --> MasukkanBeratCucian
    MasukkanBeratCucian --> SistemKalkulasiHarga
    SistemKalkulasiHarga --> PilihStatusPembayaran
    PilihStatusPembayaran --> InputCatatanOpsional
    InputCatatanOpsional --> KlikSimpanOrder
    
    state "Sistem Generate Nomor Nota Berurutan Harian (WSF-YYYYMMDD-0001)" as GenNota
    KlikSimpanOrder --> GenNota
    GenNota --> ValidasiForm
    
    state ValidasiForm <<choice>>
    ValidasiForm --> SuksesSimpan : Valid
    ValidasiForm --> TampilkanError : Tidak Valid
    TampilkanError --> MasukkanBeratCucian
    
    SuksesSimpan --> TampilkanModalCetak
    TampilkanModalCetak --> CetakNotaPDF
    CetakNotaPDF --> [*]
```

---

## 3. Sequence Diagram (Autentikasi & JWT Authorization)
Menunjukkan interaksi berurutan antara Frontend React, API Gateway FastAPI, Router Auth, dan Database PostgreSQL saat proses login admin.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin (Kasir)
    participant FE as React Frontend
    participant API as FastAPI Backend (auth.py)
    participant DB as PostgreSQL (washify_db)

    Admin->>FE: Input Email & Password (Klik Login)
    FE->>API: POST /api/auth/login {email, password}
    API->>DB: Query User WHERE email = input_email
    DB-->>API: Data User (Hashed Password)
    
    alt Password Valid
        API->>API: Generate Token JWT (Sign with SECRET_KEY)
        API-->>FE: Return HTTP 200 {token, role: 'ADMIN', email, name}
        FE->>FE: Simpan Token di localStorage
        FE->>Admin: Redirect ke /admin/dashboard
    else Password Tidak Valid / Email Tidak Ditemukan
        API-->>FE: Return HTTP 401 {detail: 'Kredensial salah'}
        FE->>Admin: Tampilkan Pesan Eror di Layar
    end
```

---

## 4. Entity Relationship Diagram (ERD)
Menggambarkan struktur relasi tabel database PostgreSQL (`washify_db`) pendukung sistem Washify.

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string password
        string role
        timestamp created_at
    }
    
    CUSTOMERS {
        int id PK
        string name
        string email
        string phone
        string address
        timestamp created_at
    }
    
    SERVICES {
        int id PK
        string service_name
        decimal price_per_kg
        boolean is_active
        timestamp created_at
    }
    
    ORDERS {
        int id PK
        string invoice_number UK
        int customer_id FK
        int service_id FK
        double weight
        decimal total_price
        string laundry_status
        string payment_status
        timestamp entry_date
        timestamp finish_date
        string notes
    }
    
    PAYMENTS {
        int id PK
        int order_id FK
        decimal amount
        string payment_method
        timestamp payment_date
    }

    CUSTOMERS ||--o{ ORDERS : "membuat"
    SERVICES ||--o{ ORDERS : "digunakan"
    ORDERS ||--o| PAYMENTS : "memiliki"
```

---

## 5. Class Diagram (Arsitektur Backend)
Memetakan class Entity SQLAlchemy dan skema validator Pydantic pada sistem backend FastAPI.

```mermaid
classDiagram
    class User {
        +Integer id
        +String name
        +String email
        +String password
        +String role
    }
    class Customer {
        +Integer id
        +String name
        +String email
        +String phone
        +String address
        +orders relation
    }
    class Service {
        +Integer id
        +String service_name
        +Decimal price_per_kg
        +Boolean is_active
        +orders relation
    }
    class Order {
        +Integer id
        +String invoice_number
        +Integer customer_id
        +Integer service_id
        +Float weight
        +Decimal total_price
        +String laundry_status
        +String payment_status
        +DateTime entry_date
        +DateTime finish_date
        +String notes
        +payment relation
    }
    class Payment {
        +Integer id
        +Integer order_id
        +Decimal amount
        +String payment_method
        +DateTime payment_date
    }
    
    Order --> Customer : Belongs To
    Order --> Service : Belongs To
    Payment --> Order : Has One
```
