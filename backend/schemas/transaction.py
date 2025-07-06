from pydantic import BaseModel, validator
from datetime import datetime

# This file defines the schemas for transaction-related data.


class TransactionCreate(BaseModel):
    type: str
    amount: float
    category: str
    description: str = ""
    date: datetime = datetime.now()

    @validator('type', 'category',pre=True,always=True)
    def normalize_strings(cls, value):
        return value.strip().lower()  

    @validator('amount', pre=True, always=True)
    def parse_amount(cls, value):
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            value = value.replace('₹', '').replace(',', '').strip()
        return float(value)
    

class TransactionOut(TransactionCreate):
    id: int

    class Config:
        from_attributes = True
