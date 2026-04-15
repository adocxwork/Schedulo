from datetime import datetime, timedelta, date, timezone, time as time_type
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import pytz

from . import models, schemas


# ─── Event Types ──────────────────────────────────────────────────────────────

def get_event_types(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.EventType).filter(
        models.EventType.is_active == True
    ).offset(skip).limit(limit).all()


def get_all_event_types(db: Session):
    return db.query(models.EventType).all()


def get_event_type(db: Session, event_type_id: int):
    return db.query(models.EventType).filter(
        models.EventType.id == event_type_id
    ).first()


def get_event_type_by_slug(db: Session, slug: str):
    return db.query(models.EventType).filter(
        models.EventType.slug == slug,
        models.EventType.is_active == True
    ).first()


def create_event_type(db: Session, event_type: schemas.EventTypeCreate):
    db_event = models.EventType(**event_type.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event_type(db: Session, event_type_id: int, event_type: schemas.EventTypeUpdate):
    db_event = get_event_type(db, event_type_id)
    if not db_event:
        return None
    update_data = event_type.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event_type(db: Session, event_type_id: int):
    db_event = get_event_type(db, event_type_id)
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event


# ─── Availability ─────────────────────────────────────────────────────────────

def get_availability(db: Session):
    return db.query(models.Availability).order_by(models.Availability.day_of_week).all()


def bulk_update_availability(db: Session, schedules: List[schemas.AvailabilityCreate]):
    # Delete all existing, replace
    db.query(models.Availability).delete()
    db_schedules = []
    for s in schedules:
        db_avail = models.Availability(**s.model_dump())
        db.add(db_avail)
        db_schedules.append(db_avail)
    db.commit()
    for s in db_schedules:
        db.refresh(s)
    return db_schedules


# ─── Available Slots ──────────────────────────────────────────────────────────

def get_available_slots(
    db: Session,
    event_type_id: int,
    target_date: date
) -> List[schemas.TimeSlot]:
    event_type = get_event_type(db, event_type_id)
    if not event_type:
        return []

    availability_records = get_availability(db)
    if not availability_records:
        return []

    # Monday=0, Sunday=6 (same as our schema)
    day_of_week = target_date.weekday()

    # Find availability for this weekday
    day_avail = [a for a in availability_records if a.day_of_week == day_of_week and a.is_active]
    if not day_avail:
        return []

    avail = day_avail[0]
    tz = pytz.timezone(avail.timezone)

    # Build start/end datetimes in local tz
    day_start = tz.localize(datetime.combine(target_date, avail.start_time))
    day_end = tz.localize(datetime.combine(target_date, avail.end_time))

    duration = timedelta(minutes=event_type.duration)
    slots = []
    current = day_start
    while current + duration <= day_end:
        slots.append({
            "start": current.astimezone(timezone.utc),
            "end": (current + duration).astimezone(timezone.utc)
        })
        current += duration

    if not slots:
        return []

    # Get existing bookings for this event type on this date
    window_start = day_start.astimezone(timezone.utc)
    window_end = day_end.astimezone(timezone.utc)

    existing = db.query(models.Booking).filter(
        models.Booking.event_type_id == event_type_id,
        models.Booking.status == models.BookingStatus.scheduled,
        models.Booking.start_time < window_end,
        models.Booking.end_time > window_start
    ).all()

    # Mark overlapping slots as unavailable
    result = []
    now_utc = datetime.now(timezone.utc)
    for slot in slots:
        if slot["start"] <= now_utc:
            continue  # skip past slots
        available = True
        for booking in existing:
            b_start = booking.start_time.replace(tzinfo=timezone.utc) if booking.start_time.tzinfo is None else booking.start_time
            b_end = booking.end_time.replace(tzinfo=timezone.utc) if booking.end_time.tzinfo is None else booking.end_time
            if slot["start"] < b_end and slot["end"] > b_start:
                available = False
                break
        result.append(schemas.TimeSlot(
            start=slot["start"],
            end=slot["end"],
            available=available
        ))

    return result


# ─── Bookings ─────────────────────────────────────────────────────────────────

def get_bookings(db: Session, status: Optional[str] = None):
    q = db.query(models.Booking)
    if status == "upcoming":
        q = q.filter(
            models.Booking.status == models.BookingStatus.scheduled,
            models.Booking.start_time >= datetime.now(timezone.utc)
        ).order_by(models.Booking.start_time.asc())
    elif status == "past":
        q = q.filter(
            or_(
                models.Booking.start_time < datetime.now(timezone.utc),
                models.Booking.status == models.BookingStatus.cancelled
            )
        ).order_by(models.Booking.start_time.desc())
    else:
        q = q.order_by(models.Booking.start_time.desc())
    return q.all()


def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()


def create_booking(db: Session, booking: schemas.BookingCreate):
    event_type = get_event_type(db, booking.event_type_id)
    if not event_type:
        return None, "Event type not found"

    # Ensure start_time is timezone-aware
    start_time = booking.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)

    end_time = start_time + timedelta(minutes=event_type.duration)

    # Double-booking check
    conflict = db.query(models.Booking).filter(
        models.Booking.event_type_id == booking.event_type_id,
        models.Booking.status == models.BookingStatus.scheduled,
        models.Booking.start_time < end_time,
        models.Booking.end_time > start_time
    ).first()

    if conflict:
        return None, "This time slot is already booked"

    db_booking = models.Booking(
        event_type_id=booking.event_type_id,
        invitee_name=booking.invitee_name,
        invitee_email=booking.invitee_email,
        start_time=start_time,
        end_time=end_time,
        notes=booking.notes,
        status=models.BookingStatus.scheduled
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking, None


def cancel_booking(db: Session, booking_id: int, reason: Optional[str] = None):
    db_booking = get_booking(db, booking_id)
    if not db_booking:
        return None
    db_booking.status = models.BookingStatus.cancelled
    db_booking.cancellation_reason = reason
    db.commit()
    db.refresh(db_booking)
    return db_booking
