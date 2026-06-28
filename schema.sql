-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'ADMIN'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    otp_code VARCHAR(10) NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE
);


-- 2. Table: customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: services
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    estimation_day INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Table: orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    weight NUMERIC(5, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    laundry_status VARCHAR(30) NOT NULL, -- 'DITERIMA', 'DICUCI', 'DISETRIKA', 'SIAP_DIAMBIL', 'SUDAH_DIAMBIL'
    payment_status VARCHAR(20) NOT NULL, -- 'BELUM_BAYAR', 'LUNAS'
    entry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finish_date TIMESTAMP,
    notes TEXT
);

-- 5. Table: payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL -- 'CASH', 'TRANSFER', 'E-WALLET'
);

-- 6. Table: reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(20) NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
    total_income NUMERIC(15, 2) NOT NULL,
    total_transaction INTEGER NOT NULL,
    report_date DATE NOT NULL
);
