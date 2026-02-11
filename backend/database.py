from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import databaseurl

engine = create_engine(
    databaseurl,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
