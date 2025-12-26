from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List
from models.base import Expense

def predict_overspend(db: Session, user_id: int, category: str) -> Dict[str, Any]:
    """
    Predict overspend for a specific category using Linear Regression
    
    Args:
        db: Database session
        user_id: User ID to get expenses for
        category: Expense category to predict
        
    Returns:
        Dictionary containing:
        - predicted_overspend: float - predicted overspend amount
        - confidence: float - model confidence score
        - data_points: int - number of historical data points used
    """
    try:
        # Get historical expenses for this category
        expenses = db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.category == category
        ).order_by(Expense.date.asc()).all()
        
        # Need at least 3 data points for meaningful prediction
        if len(expenses) < 3:
            return {
                "predicted_overspend": 0.0,
                "confidence": 0.0,
                "data_points": len(expenses),
                "message": "Insufficient historical data"
            }
        
        # Prepare data for ML model
        X, y = prepare_training_data(expenses)
        
        # Train Linear Regression model
        model = LinearRegression()
        model.fit(X, y)
        
        # Make prediction for next month
        next_month_prediction = predict_next_month(model, expenses)
        
        # Calculate overspend (prediction vs recent average)
        recent_avg = calculate_recent_average(expenses)
        overspend = max(0, next_month_prediction - recent_avg)
        
        # Calculate model confidence
        confidence = calculate_model_confidence(model, X, y)
        
        return {
            "predicted_overspend": round(overspend, 2),
            "confidence": round(confidence, 3),
            "data_points": len(expenses),
            "prediction": round(next_month_prediction, 2),
            "recent_average": round(recent_avg, 2)
        }
        
    except Exception as e:
        return {
            "predicted_overspend": 0.0,
            "confidence": 0.0,
            "data_points": 0,
            "error": str(e)
        }

def prepare_training_data(expenses: List[Expense]) -> tuple:
    """
    Prepare training data for the ML model
    
    Args:
        expenses: List of expense objects
        
    Returns:
        Tuple of (X, y) where X is features and y is target
    """
    X = []
    y = []
    
    for i, expense in enumerate(expenses):
        # Features: month index, days since first expense, amount
        month_index = expense.date.month
        days_since_first = (expense.date - expenses[0].date).days
        amount = expense.amount
        
        X.append([month_index, days_since_first, amount])
        y.append(amount)
    
    return np.array(X), np.array(y)

def predict_next_month(model: LinearRegression, expenses: List[Expense]) -> float:
    """
    Predict expense for next month
    
    Args:
        model: Trained Linear Regression model
        expenses: Historical expenses
        
    Returns:
        Predicted amount for next month
    """
    # Get the most recent expense to determine next month
    last_expense = expenses[-1]
    next_month_date = last_expense.date + timedelta(days=30)
    
    # Features for prediction
    month_index = next_month_date.month
    days_since_first = (next_month_date - expenses[0].date).days
    recent_amount = np.mean([e.amount for e in expenses[-3:]])  # Average of last 3 expenses
    
    # Make prediction
    X_pred = np.array([[month_index, days_since_first, recent_amount]])
    prediction = model.predict(X_pred)[0]
    
    return max(0, prediction)  # Ensure non-negative

def calculate_recent_average(expenses: List[Expense]) -> float:
    """Calculate average of recent expenses (last 3 months)"""
    if len(expenses) == 0:
        return 0.0
    
    recent_expenses = expenses[-3:] if len(expenses) >= 3 else expenses
    return np.mean([e.amount for e in recent_expenses])

def calculate_model_confidence(model: LinearRegression, X: np.ndarray, y: np.ndarray) -> float:
    """
    Calculate model confidence using R² score
    
    Args:
        model: Trained model
        X: Feature matrix
        y: Target values
        
    Returns:
        Confidence score between 0 and 1
    """
    try:
        # Make predictions on training data
        y_pred = model.predict(X)
        
        # Calculate R² score
        r2 = r2_score(y, y_pred)
        
        # Normalize to 0-1 range (R² can be negative)
        confidence = max(0, min(1, r2))
        
        return confidence
        
    except Exception:
        return 0.0

def get_category_trends(db: Session, user_id: int, category: str, months: int = 6) -> Dict[str, Any]:
    """
    Get spending trends for a specific category over recent months
    
    Args:
        db: Database session
        user_id: User ID
        category: Expense category
        months: Number of months to analyze
        
    Returns:
        Dictionary with trend analysis
    """
    try:
        # Get expenses for the last N months
        cutoff_date = datetime.utcnow() - timedelta(days=months * 30)
        
        expenses = db.query(Expense).filter(
            Expense.user_id == user_id,
            Expense.category == category,
            Expense.date >= cutoff_date
        ).order_by(Expense.date.asc()).all()
        
        if len(expenses) == 0:
            return {
                "trend": "no_data",
                "monthly_averages": [],
                "total_spent": 0.0
            }
        
        # Group expenses by month
        monthly_totals = {}
        for expense in expenses:
            month_key = expense.date.strftime("%Y-%m")
            if month_key not in monthly_totals:
                monthly_totals[month_key] = 0.0
            monthly_totals[month_key] += expense.amount
        
        # Calculate trend
        monthly_averages = list(monthly_totals.values())
        if len(monthly_averages) >= 2:
            recent_avg = np.mean(monthly_averages[-2:])
            older_avg = np.mean(monthly_averages[:-2]) if len(monthly_averages) > 2 else monthly_averages[0]
            
            if recent_avg > older_avg * 1.2:
                trend = "increasing"
            elif recent_avg < older_avg * 0.8:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "trend": trend,
            "monthly_averages": monthly_averages,
            "total_spent": sum(monthly_averages),
            "months_analyzed": len(monthly_totals)
        }
        
    except Exception as e:
        return {
            "trend": "error",
            "error": str(e),
            "monthly_averages": [],
            "total_spent": 0.0
        }
