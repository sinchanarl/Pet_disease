from app.models.pet_scan import Base, get_db_engine

def init_db():
    engine = get_db_engine()
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
