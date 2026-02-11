from pydantic import BaseModel
from datetime import date

class UserCreate(BaseModel):
    name: str
    email: str


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: date
    user_id: int


class IncomeCreate(BaseModel):
    amount: float
    source: str
    date: date
    user_id: int
