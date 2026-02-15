from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import models
import schemas
import ai_service
import auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        user_id = payload.get("user_id")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ---------------------------
# REGISTER
# ---------------------------

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    hashed_password = auth.hash_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


# ---------------------------
# LOGIN
# ---------------------------

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not auth.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = auth.create_access_token({"user_id": db_user.id})

    return {"access_token": token}


# ---------------------------
# EXPENSE
# ---------------------------

@app.post("/expenses")
def create_expense(
    expense: schemas.ExpenseCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_expense = models.Expense(
        amount=expense.amount,
        category=expense.category,
        user_id=current_user.id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@app.get("/expenses")
def get_expenses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()


# ---------------------------
# SUMMARY
# ---------------------------

@app.get("/summary")
def get_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id
    ).scalar() or 0

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id
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

# ---------------------------
# INCOME
# ---------------------------

@app.post("/income")
def create_income(
    income: schemas.IncomeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_income = models.Income(
        amount=income.amount,
        source=income.source,
        user_id=current_user.id
    )

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return new_income


@app.get("/income")
def get_income(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Income).filter(
        models.Income.user_id == current_user.id
    ).all()

@app.get("/ai-stream")
def ai_stream(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id
    ).scalar() or 0

    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == current_user.id
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

    return StreamingResponse(
        ai_service.generate_financial_insight_stream(summary),
        media_type="text/plain"
    )
