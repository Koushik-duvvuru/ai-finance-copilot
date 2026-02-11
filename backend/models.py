from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)

    expenses = relationship("Expense", back_populates="owner")
    incomes = relationship("Income", back_populates="owner")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    category = Column(String)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="expenses")


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    source = Column(String)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="incomes")
