from pydantic import BaseModel



class UserCreate(BaseModel):
    name: str


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    user_id: int


class IncomeCreate(BaseModel):
    amount: float
    source: str
    user_id: int
