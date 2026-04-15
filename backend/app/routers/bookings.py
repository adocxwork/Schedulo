from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("", response_model=List[schemas.BookingOut])
def list_bookings(
    status: Optional[str] = Query(None, description="upcoming | past"),
    db: Session = Depends(get_db)
):
    return crud.get_bookings(db, status=status)


@router.get("/available-slots", response_model=schemas.AvailableSlotsResponse)
def get_available_slots(
    event_type_id: int = Query(...),
    date: date = Query(...),
    db: Session = Depends(get_db)
):
    slots = crud.get_available_slots(db, event_type_id, date)
    avail = crud.get_availability(db)
    tz = avail[0].timezone if avail else "Asia/Kolkata"
    return schemas.AvailableSlotsResponse(date=date, slots=slots, timezone=tz)


@router.post("", response_model=schemas.BookingOut, status_code=201)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking, error = crud.create_booking(db, booking)
    if error:
        raise HTTPException(status_code=409, detail=error)
    return db_booking


@router.get("/{booking_id}", response_model=schemas.BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(
    booking_id: int,
    body: schemas.CancelBooking,
    db: Session = Depends(get_db)
):
    booking = crud.cancel_booking(db, booking_id, body.cancellation_reason)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
