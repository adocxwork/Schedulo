from datetime import datetime, timedelta, timezone, time
from sqlalchemy.orm import Session
from .database import get_session_local
from . import models


def seed():
    db: Session = get_session_local()()
    try:
        # Check if already seeded
        if db.query(models.EventType).count() > 0:
            print("Database already seeded, skipping.")
            return

        print("Seeding database...")

        # ── Event Types ────────────────────────────────────────────────────────
        event_types = [
            models.EventType(
                name="15 Minute Meeting",
                slug="15min",
                duration=15,
                description="A quick 15-minute sync — perfect for a check-in or brief catch-up.",
                color="#006BFF",
                location="Google Meet",
                is_active=True,
            ),
            models.EventType(
                name="30 Minute Meeting",
                slug="30min",
                duration=30,
                description="A 30-minute conversation for deeper discussions or demos.",
                color="#8B5CF6",
                location="Zoom",
                is_active=True,
            ),
            models.EventType(
                name="60 Minute Meeting",
                slug="60min",
                duration=60,
                description="A full hour for workshops, onboarding sessions, or strategy calls.",
                color="#10B981",
                location="Google Meet",
                is_active=True,
            ),
            models.EventType(
                name="Coffee Chat",
                slug="coffee-chat",
                duration=20,
                description="A casual 20-minute virtual coffee chat — let's connect!",
                color="#F59E0B",
                location="Phone Call",
                is_active=True,
            ),
        ]
        db.add_all(event_types)
        db.flush()

        # ── Availability (Mon-Fri 9am-5pm IST) ────────────────────────────────
        availability = []
        for day in range(5):  # 0=Mon, 4=Fri
            availability.append(models.Availability(
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                is_active=True,
                timezone="Asia/Kolkata",
            ))
        db.add_all(availability)
        db.flush()

        # ── Sample Bookings ────────────────────────────────────────────────────
        now_utc = datetime.now(timezone.utc)
        # Start from next Monday
        days_until_monday = (7 - now_utc.weekday()) % 7 or 7
        next_monday = now_utc.replace(
            hour=3, minute=30, second=0, microsecond=0  # 9:00 IST = 3:30 UTC
        ) + timedelta(days=days_until_monday)

        et_30 = event_types[1]   # 30min
        et_60 = event_types[2]   # 60min
        et_15 = event_types[0]   # 15min

        sample_bookings = [
            # Upcoming bookings
            models.Booking(
                event_type_id=et_30.id,
                invitee_name="Alice Johnson",
                invitee_email="alice@example.com",
                start_time=next_monday + timedelta(hours=0),      # Mon 9:30am IST
                end_time=next_monday + timedelta(hours=0, minutes=30),
                status=models.BookingStatus.scheduled,
                notes="Discuss Q2 roadmap",
            ),
            models.Booking(
                event_type_id=et_60.id,
                invitee_name="Bob Smith",
                invitee_email="bob@example.com",
                start_time=next_monday + timedelta(days=1, hours=2),  # Tue 11:30am IST
                end_time=next_monday + timedelta(days=1, hours=3),
                status=models.BookingStatus.scheduled,
                notes="Product onboarding session",
            ),
            models.Booking(
                event_type_id=et_15.id,
                invitee_name="Carol White",
                invitee_email="carol@example.com",
                start_time=next_monday + timedelta(days=2, hours=1),   # Wed 10:30am IST
                end_time=next_monday + timedelta(days=2, hours=1, minutes=15),
                status=models.BookingStatus.scheduled,
            ),
            # Past bookings
            models.Booking(
                event_type_id=et_30.id,
                invitee_name="David Brown",
                invitee_email="david@example.com",
                start_time=now_utc - timedelta(days=3, hours=2),
                end_time=now_utc - timedelta(days=3, hours=1, minutes=30),
                status=models.BookingStatus.scheduled,
                notes="Past meeting: Project kickoff",
            ),
            models.Booking(
                event_type_id=et_60.id,
                invitee_name="Emma Davis",
                invitee_email="emma@example.com",
                start_time=now_utc - timedelta(days=7, hours=3),
                end_time=now_utc - timedelta(days=7, hours=2),
                status=models.BookingStatus.cancelled,
                notes="Strategy session",
                cancellation_reason="Reschedule needed",
            ),
        ]
        db.add_all(sample_bookings)
        db.commit()

        print(f"[OK] Seeded {len(event_types)} event types, {len(availability)} availability slots, {len(sample_bookings)} bookings.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seed failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
