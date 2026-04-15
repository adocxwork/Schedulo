from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/availability", tags=["availability"])


@router.get("", response_model=List[schemas.AvailabilityOut])
def get_availability(db: Session = Depends(get_db)):
    return crud.get_availability(db)


@router.put("", response_model=List[schemas.AvailabilityOut])
def update_availability(
    body: schemas.AvailabilityBulkUpdate,
    db: Session = Depends(get_db)
):
    return crud.bulk_update_availability(db, body.schedules)
