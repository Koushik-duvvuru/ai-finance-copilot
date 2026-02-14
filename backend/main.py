from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
import ai_service
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "API is running"}


@app.post("/users")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    new_user = models.User(name=user.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.post("/expenses")
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = models.Expense(
        amount=expense.amount,
        category=expense.category,
        user_id=expense.user_id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@app.get("/expenses/{user_id}")
def get_expenses(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).all()

@app.post("/income")
def create_income(income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    new_income = models.Income(
        amount=income.amount,
        source=income.source,
        user_id=income.user_id
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@app.get("/income/{user_id}")
def get_income(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Income).filter(
        models.Income.user_id == user_id
    ).all()


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

    summary = {
        "total_income": total_income,
        "total_expense": total_expense,
        "savings": savings,
        "savings_percent": round(savings_percent, 2),
    }

    summary["financial_score"] = ai_service.calculate_financial_score(summary)

    return summary

@app.get("/ai-stream/{user_id}")
def stream_ai(user_id: int, db: Session = Depends(get_db)):

    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id
    ).scalar() or 0

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id
    ).scalar() or 0

    savings = total_income - total_expense
    savings_percent = (savings / total_income * 100) if total_income > 0 else 0

    summary = {
        "total_income": total_income,
        "total_expense": total_expense,
        "savings": savings,
        "savings_percent": round(savings_percent, 2),
    }

    return StreamingResponse(
        ai_service.generate_financial_insight_stream(summary),
        media_type="text/plain"
    )
