"""
Run this script once to seed the database with initial data:
  python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app import models
from app.auth import hash_password
import datetime

def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing_admin = db.query(models.User).filter(models.User.email == "admin@washify.com").first()
        if not existing_admin:
            admin = models.User(
                name="Washify Admin",
                email="admin@washify.com",
                password=hash_password("admin123"),
                role="ADMIN",
                is_verified=True,
                otp_code=None
            )
            db.add(admin)
            db.commit()
            print("✓ Admin user created: admin@washify.com / admin123")
        else:
            # Update password to ensure it's correct
            existing_admin.password = hash_password("admin123")
            db.commit()
            print("✓ Admin password reset: admin@washify.com / admin123")

        # Seed services if empty
        if db.query(models.Service).count() == 0:
            services = [
                models.Service(service_name="Cuci Kering", price_per_kg=6000, estimation_day=2, is_active=True),
                models.Service(service_name="Cuci Setrika", price_per_kg=8000, estimation_day=3, is_active=True),
                models.Service(service_name="Setrika Saja", price_per_kg=5000, estimation_day=1, is_active=True),
                models.Service(service_name="Express", price_per_kg=12000, estimation_day=1, is_active=True),
            ]
            db.add_all(services)
            db.commit()
            print("✓ Services seeded")

        # Seed customers if empty
        if db.query(models.Customer).count() == 0:
            customers = [
                models.Customer(name="Budi Santoso", phone="081234567890", address="Jl. Merdeka No. 10, Jakarta", email="budi@gmail.com", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30)),
                models.Customer(name="Siti Aminah", phone="085712345678", address="Jl. Mawar No. 4, Bandung", email="siti@gmail.com", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=25)),
                models.Customer(name="Rian Hidayat", phone="081398765432", address="Jl. Sudirman No. 120, Surabaya", email="rian@gmail.com", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15)),
            ]
            db.add_all(customers)
            db.commit()
            print("✓ Customers seeded")

        # Seed orders if empty
        if db.query(models.Order).count() == 0:
            from decimal import Decimal
            orders_data = [
                # Past completed orders
                (1, 2, "WSF-20260604-0001", Decimal("3.5"), Decimal("28000"), "SUDAH_DIAMBIL", "LUNAS", 10, 7, "Selesai tepat waktu"),
                (2, 1, "WSF-20260605-0001", Decimal("2.0"), Decimal("12000"), "SUDAH_DIAMBIL", "LUNAS", 9, 7, "Wangi melati"),
                (3, 4, "WSF-20260606-0001", Decimal("4.0"), Decimal("48000"), "SUDAH_DIAMBIL", "LUNAS", 8, 7, "Express kilat"),
                (1, 1, "WSF-20260607-0001", Decimal("5.0"), Decimal("30000"), "SUDAH_DIAMBIL", "LUNAS", 7, 5, None),
                (2, 2, "WSF-20260608-0001", Decimal("3.0"), Decimal("24000"), "SUDAH_DIAMBIL", "LUNAS", 6, 3, "Rapih sekali"),
                (3, 3, "WSF-20260609-0001", Decimal("2.5"), Decimal("12500"), "SUDAH_DIAMBIL", "LUNAS", 5, 4, None),
                (1, 2, "WSF-20260610-0001", Decimal("4.5"), Decimal("36000"), "SUDAH_DIAMBIL", "LUNAS", 4, 1, "Pakaian kerja"),
                (2, 4, "WSF-20260611-0001", Decimal("3.0"), Decimal("36000"), "SUDAH_DIAMBIL", "LUNAS", 3, 2, "Express penting"),
                (3, 1, "WSF-20260612-0001", Decimal("6.0"), Decimal("36000"), "SUDAH_DIAMBIL", "LUNAS", 2, 1, None),
                # Active orders
                (1, 2, "WSF-20260613-0001", Decimal("4.0"), Decimal("32000"), "DICUCI", "LUNAS", 1, None, "Cuci bersih noda tanah"),
                (2, 4, "WSF-20260613-0002", Decimal("2.5"), Decimal("30000"), "DISETRIKA", "BELUM_BAYAR", 1, None, "Gantungan baju sendiri"),
                (3, 3, "WSF-20260614-0001", Decimal("3.0"), Decimal("15000"), "DITERIMA", "BELUM_BAYAR", 0, None, "Setrika rapih"),
            ]
            
            now = datetime.datetime.utcnow()
            for i, (cid, sid, inv, wt, price, lstatus, pstatus, entry_days_ago, finish_days_ago, notes) in enumerate(orders_data):
                order = models.Order(
                    customer_id=cid, service_id=sid, invoice_number=inv,
                    weight=wt, total_price=price,
                    laundry_status=lstatus, payment_status=pstatus,
                    entry_date=now - datetime.timedelta(days=entry_days_ago),
                    finish_date=now - datetime.timedelta(days=finish_days_ago) if finish_days_ago is not None else None,
                    notes=notes
                )
                db.add(order)
            db.commit()
            print("✓ Orders seeded")

        # Seed payments for LUNAS orders
        if db.query(models.Payment).count() == 0:
            lunas_orders = db.query(models.Order).filter(models.Order.payment_status == "LUNAS").all()
            methods = ["CASH", "CASH", "TRANSFER", "E-WALLET", "CASH", "TRANSFER", "E-WALLET", "CASH", "TRANSFER", "E-WALLET"]
            for i, order in enumerate(lunas_orders):
                payment = models.Payment(
                    order_id=order.id,
                    amount=order.total_price,
                    payment_date=order.entry_date,
                    payment_method=methods[i % len(methods)]
                )
                db.add(payment)
            db.commit()
            print("✓ Payments seeded")

        print("\n✅ Seeding complete! Login dengan: admin@washify.com / admin123")
    except Exception as e:
        db.rollback()
        print(f"❌ Error saat seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
