from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
import datetime
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])

@router.get("", response_model=schemas.PredictionResponse)
def get_predictions(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=30)
    
    start_dt = datetime.datetime.combine(start_date, datetime.time.min)
    end_dt = datetime.datetime.combine(end_date, datetime.time.max)
    
    orders = db.query(models.Order).filter(
        models.Order.payment_status == "LUNAS",
        models.Order.entry_date >= start_dt,
        models.Order.entry_date <= end_dt
    ).all()

    # Aggregate income by date
    daily_income = {}
    temp = start_date
    while temp <= end_date:
        daily_income[temp] = Decimal("0.00")
        temp += datetime.timedelta(days=1)
        
    non_zero_days = 0
    for o in orders:
        o_date = o.entry_date.date()
        if o_date in daily_income:
            daily_income[o_date] += o.total_price
            
    for k, v in daily_income.items():
        if v > 0:
            non_zero_days += 1

    # Format historical points for return
    historical_points_out = {k.strftime("%Y-%m-%d"): v for k, v in daily_income.items()}

    # Check if we have enough data (at least 3 days of non-zero transaction days)
    if non_zero_days < 3:
        return schemas.PredictionResponse(
            prediction7Days=None,
            prediction30Days=None,
            historicalPoints=historical_points_out,
            predictionPoints={},
            status="Data transaksi belum cukup untuk membuat prediksi."
        )

    # Simple Linear Regression calculation
    # X values: 0, 1, 2, ..., 30
    # Y values: daily incomes
    x_data = []
    y_data = []
    
    sorted_dates = sorted(list(daily_income.keys()))
    for idx, d in enumerate(sorted_dates):
        x_data.append(float(idx))
        y_data.append(float(daily_income[d]))
        
    n = len(x_data)
    mean_x = sum(x_data) / n
    mean_y = sum(y_data) / n
    
    num = 0.0
    den = 0.0
    for i in range(n):
        diff_x = x_data[i] - mean_x
        diff_y = y_data[i] - mean_y
        num += diff_x * diff_y
        den += diff_x * diff_x
        
    if den == 0:
        slope = 0.0
        intercept = mean_y
    else:
        slope = num / den
        intercept = mean_y - slope * mean_x

    # Calculate Projections
    pred_7_days = Decimal("0.00")
    pred_30_days = Decimal("0.00")
    prediction_points = {}
    
    start_predict_index = n # Tomorrow
    
    # 7 Days
    for i in range(7):
        next_x = start_predict_index + i
        pred_y = max(0.0, slope * next_x + intercept)
        pred_dec = Decimal(str(round(pred_y, 2)))
        pred_7_days += pred_dec
        
        future_date = end_date + datetime.timedelta(days=i + 1)
        prediction_points[future_date.strftime("%Y-%m-%d")] = pred_dec
        
    # 30 Days
    for i in range(30):
        next_x = start_predict_index + i
        pred_y = max(0.0, slope * next_x + intercept)
        pred_dec = Decimal(str(round(pred_y, 2)))
        pred_30_days += pred_dec

    return schemas.PredictionResponse(
        prediction7Days=pred_7_days,
        prediction30Days=pred_30_days,
        historicalPoints=historical_points_out,
        predictionPoints=prediction_points,
        status="Success"
    )
