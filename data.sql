-- Seed default admin account
-- Password is 'admin123' (bcrypt: $2a$10$8.Z1T.tF2R0y16V556209u/7y/f3Y0GgqG7H3V6zQ7rV6tG8K7t2m)
INSERT INTO users (name, email, password, role, created_at)
VALUES ('Washify Admin', 'admin@washify.com', '$2a$10$8.Z1T.tF2R0y16V556209u/7y/f3Y0GgqG7H3V6zQ7rV6tG8K7t2m', 'ADMIN', NOW());

-- Seed initial services
INSERT INTO services (service_name, price_per_kg, estimation_day, is_active) VALUES
('Cuci Kering', 6000.00, 2, TRUE),
('Cuci Setrika', 8000.00, 3, TRUE),
('Setrika Saja', 5000.00, 1, TRUE),
('Express', 12000.00, 1, TRUE);

-- Seed initial customers
INSERT INTO customers (name, phone, address, email, created_at) VALUES
('Budi Santoso', '081234567890', 'Jl. Merdeka No. 10, Jakarta', 'budi@gmail.com', NOW() - INTERVAL '30 days'),
('Siti Aminah', '085712345678', 'Jl. Mawar No. 4, Bandung', 'siti@gmail.com', NOW() - INTERVAL '25 days'),
('Rian Hidayat', '081398765432', 'Jl. Sudirman No. 120, Surabaya', 'rian@gmail.com', NOW() - INTERVAL '15 days');

-- Seed past orders for dashboard and reports/prediction calculations (spread over past 10 days)
INSERT INTO orders (customer_id, service_id, invoice_number, weight, total_price, laundry_status, payment_status, entry_date, finish_date, notes) VALUES
(1, 2, 'WSF-20260604-0001', 3.5, 28000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days', 'Selesai tepat waktu'),
(2, 1, 'WSF-20260605-0001', 2.0, 12000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '9 days', NOW() - INTERVAL '7 days', 'Wangi melati'),
(3, 4, 'WSF-20260606-0001', 4.0, 48000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', 'Express kilat'),
(1, 1, 'WSF-20260607-0001', 5.0, 30000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', NULL),
(2, 2, 'WSF-20260608-0001', 3.0, 24000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days', 'Rapih sekali'),
(3, 3, 'WSF-20260609-0001', 2.5, 12500.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NULL),
(1, 2, 'WSF-20260610-0001', 4.5, 36000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day', 'Pakaian kerja'),
(2, 4, 'WSF-20260611-0001', 3.0, 36000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'Express penting'),
(3, 1, 'WSF-20260612-0001', 6.0, 36000.00, 'SUDAH_DIAMBIL', 'LUNAS', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NULL),
-- Active Orders (not finished yet)
(1, 2, 'WSF-20260613-0001', 4.0, 32000.00, 'DICUCI', 'LUNAS', NOW() - INTERVAL '1 day', NULL, 'Cuci bersih noda tanah'),
(2, 4, 'WSF-20260613-0002', 2.5, 30000.00, 'DISETRIKA', 'BELUM_BAYAR', NOW() - INTERVAL '1 day', NULL, 'Gantungan baju sendiri'),
(3, 3, 'WSF-20260614-0001', 3.0, 15000.00, 'DITERIMA', 'BELUM_BAYAR', NOW(), NULL, 'Setrika rapih');

-- Seed payments for orders that are LUNAS
INSERT INTO payments (order_id, amount, payment_date, payment_method) VALUES
(1, 28000.00, NOW() - INTERVAL '10 days', 'CASH'),
(2, 12000.00, NOW() - INTERVAL '9 days', 'CASH'),
(3, 48000.00, NOW() - INTERVAL '8 days', 'TRANSFER'),
(4, 30000.00, NOW() - INTERVAL '7 days', 'E-WALLET'),
(5, 24000.00, NOW() - INTERVAL '6 days', 'CASH'),
(6, 12500.00, NOW() - INTERVAL '5 days', 'TRANSFER'),
(7, 36000.00, NOW() - INTERVAL '4 days', 'E-WALLET'),
(8, 36000.00, NOW() - INTERVAL '3 days', 'CASH'),
(9, 36000.00, NOW() - INTERVAL '2 days', 'TRANSFER'),
(10, 32000.00, NOW() - INTERVAL '1 day', 'E-WALLET');
