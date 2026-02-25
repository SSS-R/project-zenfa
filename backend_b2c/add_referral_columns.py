import uuid
from sqlmodel import Session, select, text
from app.database import engine
from app.models.user import User

def migrate_gamification():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN referral_code VARCHAR;"))
            conn.execute(text("ALTER TABLE users ADD CONSTRAINT uq_users_referral_code UNIQUE(referral_code);"))
        except Exception as e:
            print("Referral code column might already exist:", e)

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);"))
        except Exception as e:
            print("Referred by column might already exist:", e)
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN total_referrals INTEGER DEFAULT 0;"))
        except Exception as e:
            print("Total referrals column might already exist:", e)

    print("Migration schema applied. Backfilling referral codes...")

    with Session(engine) as session:
        users = session.exec(select(User)).all()
        for user in users:
            if not user.referral_code:
                # generate new code based on default_factory logic from model
                import string
                import random
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                user.referral_code = code
                if user.total_referrals is None:
                    user.total_referrals = 0
                session.add(user)
                print(f"Backfilled {user.email} with referral code {code}")
        session.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate_gamification()
