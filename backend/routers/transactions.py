# --- backend/routers/transactions.py ---
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, time, datetime
from databases.database import get_db
from schemas.transaction import TransactionCreate, TransactionOut
from models.models import Transaction, User
from utils.auth import get_current_user
from services.receipt_parser import extract_text_from_image, extract_table_from_pdf


# This file defines the transaction-related routes for adding, listing, and uploading transactions.
# It includes endpoints for adding a new transaction, listing transactions with filters, and uploading receipts.

router = APIRouter()

@router.post("/", response_model=TransactionOut)
def add_transaction(
    trans: TransactionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    transaction = Transaction(**trans.dict(), owner_id=user.id)
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

@router.get("/")
def list_transactions(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(10, ge=1),                             #Setting limit for pagination
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Transaction).filter(Transaction.owner_id == user.id)

    if start_date:
        start_datetime = datetime.combine(start_date, time.min)
        query = query.filter(Transaction.date >= start_datetime)

    if end_date:
        end_datetime = datetime.combine(end_date, time.max)
        query = query.filter(Transaction.date <= end_datetime)

    if type:
        query = query.filter(Transaction.type.ilike(type))

    if category:
        query = query.filter(Transaction.category.ilike(category))

    total = query.count()
    transactions = query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all() #Ordering transactions by date in descending order

    return JSONResponse(content=jsonable_encoder({
        "total": total,
        "transactions": [TransactionOut.from_orm(t).dict() for t in transactions]
    }))


@router.post("/upload-receipt")
def upload_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    transactions = extract_text_from_image(file)

    count = 0
    for t in transactions:              # Extracting transactions from the receipt 
        if "amount" in t and "type" in t:
            if not t.get("title"):
                t["title"] = "Untitled"
            t["date"] = t.get("date", datetime.now())
            t["type"] = t.get("type", "expense").lower() 
            trans = Transaction(**t, owner_id=user.id)
            db.add(trans)
            count += 1

    db.commit()
    return {"added": count, "transactions": transactions}

@router.post("/upload-pdf")
def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    transactions = extract_table_from_pdf(file)

    count = 0
    for t in transactions:              # Extracting transactions from the pdf
        if "amount" in t and "type" in t:
            if not t.get("title"):
                t["title"] = "Untitled"
            t["date"] = t.get("date", datetime.now())
            t["type"] = t.get("type", "expense").lower() 
            trans = Transaction(**t, owner_id=user.id)
            db.add(trans)
            count += 1

    db.commit()
    return {"added": count, "transactions": transactions}
