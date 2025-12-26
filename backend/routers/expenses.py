from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.base import Expense, User, Category
from routers.auth import get_current_user

# Pydantic models
class ExpenseCreate(BaseModel):
    amount: float
    category: Category
    date: Optional[datetime] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: Category
    date: datetime
    notes: Optional[str]
    receipt_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionResponse(BaseModel):
    category: Category
    predicted_overspend: float
    confidence: float

# Router
router = APIRouter()

@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if expense.date is None:
        expense.date = datetime.utcnow()
    
    db_expense = Expense(
        user_id=current_user.id,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        notes=expense.notes,
        receipt_url=expense.receipt_url
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    return db_expense

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[Category] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    if category:
        query = query.filter(Expense.category == category)
    
    expenses = query.order_by(Expense.date.desc()).offset(skip).limit(limit).all()
    return expenses

@router.get("/summary/{year}/{month}")
def get_expense_summary_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get total expenses by category for specified month
    month_start = datetime(year, month, 1, 0, 0, 0, 0)
    if month == 12:
        month_end = datetime(year + 1, 1, 1, 0, 0, 0, 0)
    else:
        month_end = datetime(year, month + 1, 1, 0, 0, 0, 0)
    
    summary = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter(
        Expense.user_id == current_user.id,
        Expense.date >= month_start,
        Expense.date < month_end
    ).group_by(Expense.category).all()
    
    grand_total = sum([float(total) for _, total, _ in summary])
    
    return {
        "year": year,
        "month": month,
        "categories": [
            {"category": cat, "total": float(total), "count": count, "average": float(total) / count}
            for cat, total, count in summary
        ],
        "grand_total": grand_total
    }

@router.get("/summary")
def get_expense_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get total expenses by category for the current month
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    summary = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total'),
        func.count(Expense.id).label('count')
    ).filter(
        Expense.user_id == current_user.id,
        Expense.date >= current_month_start
    ).group_by(Expense.category).all()
    
    return {
        "month": current_month_start.strftime("%Y-%m"),
        "summary": [
            {"category": cat, "total": float(total), "count": count}
            for cat, total, count in summary
        ]
    }

@router.post("/predict/{category}", response_model=PredictionResponse)
def predict_expense_category(
    category: Category,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ..services.ml_predictor import predict_overspend
    
    try:
        prediction = predict_overspend(db, current_user.id, category.value)
        return PredictionResponse(
            category=category,
            predicted_overspend=prediction.get("predicted_overspend", 0.0),
            confidence=prediction.get("confidence", 0.0)
        )
    except Exception as e:
        # If prediction fails, return default values
        return PredictionResponse(
            category=category,
            predicted_overspend=0.0,
            confidence=0.0
        )

@router.post("/predict", response_model=List[PredictionResponse])
def predict_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ..services.ml_predictor import predict_overspend
    
    predictions = []
    
    # Get predictions for each category
    for category in Category:
        try:
            prediction = predict_overspend(db, current_user.id, category.value)
            predictions.append(PredictionResponse(
                category=category,
                predicted_overspend=prediction.get("predicted_overspend", 0.0),
                confidence=prediction.get("confidence", 0.0)
            ))
        except Exception as e:
            # If prediction fails for a category, skip it
            continue
    
    return predictions

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    return expense

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_update: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    # Update expense fields
    expense.amount = expense_update.amount
    expense.category = expense_update.category
    expense.date = expense_update.date or expense.date
    expense.notes = expense_update.notes
    expense.receipt_url = expense_update.receipt_url
    
    db.commit()
    db.refresh(expense)
    
    return expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    db.delete(expense)
    db.commit()
    
    return {"message": "Expense deleted successfully"}
