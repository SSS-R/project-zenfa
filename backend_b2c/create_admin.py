import sys
from sqlmodel import Session, select
from app.database import engine, init_db
from app.models.user import User, RoleEnum
from app.services.auth_service import get_password_hash

def create_default_admin():
    init_db()
    
    with Session(engine) as session:
        statement = select(User).where(User.email == "admin@pclagbe.com")
        existing_admin = session.exec(statement).first()
        
        if existing_admin:
            print("Admin user already exists. Email: admin@pclagbe.com")
            
            # ensure role is admin just in case
            if existing_admin.role != RoleEnum.ADMIN:
                existing_admin.role = RoleEnum.ADMIN
                session.add(existing_admin)
                session.commit()
                print("Updated existing user to ADMIN role.")
                
            return
            
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            email="admin@pclagbe.com",
            password_hash=hashed_password,
            display_name="System Admin",
            role=RoleEnum.ADMIN,
            is_verified=True,
            token_balance=1000
        )
        
        session.add(admin_user)
        session.commit()
        print("Created default admin user. Email: admin@pclagbe.com | Password: admin123")

if __name__ == "__main__":
    create_default_admin()
