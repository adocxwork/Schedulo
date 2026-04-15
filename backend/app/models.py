import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, Text, ForeignKey,
    DateTime, Time, Enum as SAEnum, func
)
from sqlalchemy.orm import relationship
from .database import Base


class BookingStatus(str, enum.Enum):
    scheduled = "scheduled"
    cancelled = "cancelled"


class EventType(Base):
    __tablename__ = "event_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    duration = Column(Integer, nullable=False, default=30)  # minutes
    description = Column(Text, nullable=True)
    color = Column(String(20), nullable=False, default="#006BFF")
    location = Column(String(255), nullable=True, default="Google Meet")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bookings = relationship("Booking", back_populates="event_type", cascade="all, delete-orphan")


class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    timezone = Column(String(100), nullable=False, default="Asia/Kolkata")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=False)
    invitee_name = Column(String(255), nullable=False)
    invitee_email = Column(String(255), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.scheduled, nullable=False)
    notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event_type = relationship("EventType", back_populates="bookings")
