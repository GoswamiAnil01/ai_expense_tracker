from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Optional
from ..models.base import Expense, User, Category

class ExpenseCRUD:
    """CRUD operations for expenses"""
    
    def create(self, db: Session, user_id: int, expense_data: dict) -> Expense:
        """Create a new expense"""
        db_expense = Expense(
            user_id=user_id,
            amount=expense_data["amount"],
            category=expense_data["category"],
            date=expense_data.get("date", datetime.utcnow()),
            notes=expense_data.get("notes"),
            receipt_url=expense_data.get("receipt_url")
        )
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        return db_expense
    
    def get_by_id(self, db: Session, user_id: int, expense_id: int) -> Optional[Expense]:
        """Get expense by ID for a specific user"""
        return db.query(Expense).filter(
            and_(Expense.id == expense_id, Expense.user_id == user_id)
        ).first()
    
    def get_user_expenses(
        self, 
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[Category] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Expense]:
        """Get expenses for a user with optional filters"""
        query = db.query(Expense).filter(Expense.user_id == user_id)
        
        if category:
            query = query.filter(Expense.category == category)
        
        if start_date:
            query = query.filter(Expense.date >= start_date)
        
        if end_date:
            query = query.filter(Expense.date <= end_date)
        
        return query.order_by(Expense.date.desc()).offset(skip).limit(limit).all()
    
    def update(self, db: Session, user_id: int, expense_id: int, expense_data: dict) -> Optional[Expense]:
        """Update an expense"""
        db_expense = self.get_by_id(db, user_id, expense_id)
        if not db_expense:
            return None
        
        # Update fields
        for key, value in expense_data.items():
            if hasattr(db_expense, key) and key != "id" and key != "user_id":
                setattr(db_expense, key, value)
        
        db.commit()
        db.refresh(db_expense)
        return db_expense
    
    def delete(self, db: Session, user_id: int, expense_id: int) -> bool:
        """Delete an expense"""
        db_expense = self.get_by_id(db, user_id, expense_id)
        if not db_expense:
            return False
        
        db.delete(db_expense)
        db.commit()
        return True
    
    def get_monthly_summary(self, db: Session, user_id: int, year: int, month: int) -> dict:
        """Get monthly expense summary by category"""
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        summary = db.query(
            Expense.category,
            func.sum(Expense.amount).label('total'),
            func.count(Expense.id).label('count'),
            func.avg(Expense.amount).label('average')
        ).filter(
            and_(
                Expense.user_id == user_id,
                Expense.date >= start_date,
                Expense.date < end_date
            )
        ).group_by(Expense.category).all()
        
        return {
            "year": year,
            "month": month,
            "categories": [
                {
                    "category": cat,
                    "total": float(total),
                    "count": count,
                    "average": float(average)
                }
                for cat, total, count, average in summary
            ],
            "grand_total": sum(float(total) for _, total, _, _ in summary)
        }
    
    def get_yearly_summary(self, db: Session, user_id: int, year: int) -> dict:
        """Get yearly expense summary by month"""
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)
        
        monthly_data = db.query(
            func.date_trunc('month', Expense.date).label('month'),
            func.sum(Expense.amount).label('total'),
            func.count(Expense.id).label('count')
        ).filter(
            and_(
                Expense.user_id == user_id,
                Expense.date >= start_date,
                Expense.date < end_date
            )
        ).group_by(func.date_trunc('month', Expense.date)).all()
        
        return {
            "year": year,
            "months": [
                {
                    "month": month.month,
                    "total": float(total),
                    "count": count
                }
                for month, total, count in monthly_data
            ],
            "grand_total": sum(float(total) for _, total, _ in monthly_data)
        }
    
    def get_category_trends(
        self, 
        db: Session, 
        user_id: int, 
        category: Category, 
        months: int = 6
    ) -> dict:
        """Get spending trends for a specific category"""
        cutoff_date = datetime.utcnow() - timedelta(days=months * 30)
        
        expenses = db.query(Expense).filter(
            and_(
                Expense.user_id == user_id,
                Expense.category == category,
                Expense.date >= cutoff_date
            )
        ).order_by(Expense.date.asc()).all()
        
        # Group by month
        monthly_data = {}
        for expense in expenses:
            month_key = expense.date.strftime("%Y-%m")
            if month_key not in monthly_data:
                monthly_data[month_key] = []
            monthly_data[month_key].append(expense.amount)
        
        # Calculate monthly averages
        monthly_averages = {
            month: sum(amounts) / len(amounts)
            for month, amounts in monthly_data.items()
        }
        
        return {
            "category": category.value,
            "months_analyzed": len(monthly_averages),
            "monthly_averages": monthly_averages,
            "total_expenses": len(expenses),
            "average_amount": sum(e.amount for e in expenses) / len(expenses) if expenses else 0
        }
    
    def get_top_expenses(self, db: Session, user_id: int, limit: int = 10) -> List[Expense]:
        """Get top expenses by amount for a user"""
        return db.query(Expense).filter(
            Expense.user_id == user_id
        ).order_by(Expense.amount.desc()).limit(limit).all()
    
    def get_expense_statistics(self, db: Session, user_id: int) -> dict:
        """Get overall expense statistics for a user"""
        stats = db.query(
            func.count(Expense.id).label('total_expenses'),
            func.sum(Expense.amount).label('total_amount'),
            func.avg(Expense.amount).label('average_amount'),
            func.min(Expense.amount).label('min_amount'),
            func.max(Expense.amount).label('max_amount')
        ).filter(Expense.user_id == user_id).first()
        
        # Get category breakdown
        category_stats = db.query(
            Expense.category,
            func.count(Expense.id).label('count'),
            func.sum(Expense.amount).label('total')
        ).filter(Expense.user_id == user_id).group_by(Expense.category).all()
        
        return {
            "total_expenses": stats.total_expenses or 0,
            "total_amount": float(stats.total_amount or 0),
            "average_amount": float(stats.average_amount or 0),
            "min_amount": float(stats.min_amount or 0),
            "max_amount": float(stats.max_amount or 0),
            "category_breakdown": [
                {
                    "category": cat.value,
                    "count": count,
                    "total": float(total)
                }
                for cat, count, total in category_stats
            ]
        }

# Create CRUD instance
expense_crud = ExpenseCRUD()
