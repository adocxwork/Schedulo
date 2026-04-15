from datetime import datetime, time, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, field_validator
import re


# ─── Event Type Schemas ────────────────────────────────────────────────────────

class EventTypeBase(BaseModel):
    name: str
    slug: str
    duration: int = 30
    description: Optional[str] = None
    color: str = "#006BFF"
    location: Optional[str] = "Google Meet"
    is_active: bool = True

    @field_validator("slug")
    @classmethod
    def slug_must_be_url_safe(cls, v: str) -> str:
        v = v.lower().strip()
        v = re.sub(r"[^a-z0-9-]", "-", v)
        v = re.sub(r"-+", "-", v).strip("-")
        return v


class EventTypeCreate(EventTypeBase):
    pass


class EventTypeUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    duration: Optional[int] = None
    description: Optional[str] = None
    color: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class EventTypeOut(EventTypeBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Availability Schemas ──────────────────────────────────────────────────────

class AvailabilityBase(BaseModel):
    day_of_week: int  # 0=Monday … 6=Sunday
    start_time: time
    end_time: time
    is_active: bool = True
    timezone: str = "Asia/Kolkata"


class AvailabilityCreate(AvailabilityBase):
    pass


class AvailabilityUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_active: Optional[bool] = None
    timezone: Optional[str] = None


class AvailabilityOut(AvailabilityBase):
    id: int

    model_config = {"from_attributes": True}


class AvailabilityBulkUpdate(BaseModel):
    schedules: List[AvailabilityCreate]


# ─── Booking Schemas ───────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    event_type_id: int
    invitee_name: str
    invitee_email: EmailStr
    start_time: datetime
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    event_type_id: int
    invitee_name: str
    invitee_email: str
    start_time: datetime
    end_time: datetime
    status: str
    notes: Optional[str]
    cancellation_reason: Optional[str]
    created_at: datetime
    event_type: EventTypeOut

    model_config = {"from_attributes": True}


class CancelBooking(BaseModel):
    cancellation_reason: Optional[str] = None


# ─── Available Slots ───────────────────────────────────────────────────────────

class TimeSlot(BaseModel):
    start: datetime
    end: datetime
    available: bool = True


class AvailableSlotsResponse(BaseModel):
    date: date
    slots: List[TimeSlot]
    timezone: str
