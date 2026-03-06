import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database.session import SessionLocal
from app.models.user import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.role == UserRole.admin).first()
        if existing:
            print("✅ Admin already exists. Skipping.")
            return

        # Create admin
        admin = User(
            name="Admin",
            email="admin@shop.com",
            password_hash=pwd_context.hash("admin123"),
            role=UserRole.admin,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("✅ Admin created successfully!")
        print("   Email   : admin@shop.com")
        print("   Password: admin123")
        print("   ⚠️  Change this password after first login!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()