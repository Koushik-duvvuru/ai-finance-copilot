from fastapi import FastAPI,Depends
from database import SessionLocal,engine, Base
from sqlalchemy.orm import Session
import models,schema
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "AI Finance Copilot Backend Running"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users")
def create_user(user: schema.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(name=user.name, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/expenses")
def add_expense(expense: schema.ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = models.Expense(
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        user_id=expense.user_id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@app.get("/expenses/{user_id}")
def get_expenses(user_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.user_id == user_id).all()
    return expenses

@app.post("/income")
def add_income(income: schema.IncomeCreate, db: Session = Depends(get_db)):
    new_income = models.Income(
        amount=income.amount,
        source=income.source,
        date=income.date,
        user_id=income.user_id
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@app.get("/summary/{user_id}")
def get_summary(user_id: int, db: Session = Depends(get_db)):

    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id
    ).scalar() or 0

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id
    ).scalar() or 0

    savings = total_income - total_expense

    savings_percent = (savings / total_income * 100) if total_income > 0 else 0

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "savings": savings,
        "savings_percent": round(savings_percent, 2)
    }

