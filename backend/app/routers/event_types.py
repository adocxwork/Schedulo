from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/event-types", tags=["event-types"])


@router.get("", response_model=List[schemas.EventTypeOut])
def list_event_types(db: Session = Depends(get_db)):
    return crud.get_event_types(db)


@router.get("/all", response_model=List[schemas.EventTypeOut])
def list_all_event_types(db: Session = Depends(get_db)):
    return crud.get_all_event_types(db)


@router.post("", response_model=schemas.EventTypeOut, status_code=201)
def create_event_type(event_type: schemas.EventTypeCreate, db: Session = Depends(get_db)):
    existing = crud.get_event_type_by_slug(db, event_type.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    return crud.create_event_type(db, event_type)


@router.get("/{slug}", response_model=schemas.EventTypeOut)
def get_event_type_by_slug(slug: str, db: Session = Depends(get_db)):
    et = crud.get_event_type_by_slug(db, slug)
    if not et:
        raise HTTPException(status_code=404, detail="Event type not found")
    return et


@router.put("/{event_type_id}", response_model=schemas.EventTypeOut)
def update_event_type(
    event_type_id: int,
    event_type: schemas.EventTypeUpdate,
    db: Session = Depends(get_db)
):
    if event_type.slug is not None:
        existing = crud.get_event_type_by_slug(db, event_type.slug)
        if existing and existing.id != event_type_id:
            raise HTTPException(status_code=400, detail="Slug already exists")

    updated = crud.update_event_type(db, event_type_id, event_type)
    if not updated:
        raise HTTPException(status_code=404, detail="Event type not found")
    return updated


@router.delete("/{event_type_id}", status_code=204)
def delete_event_type(event_type_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_event_type(db, event_type_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event type not found")
    return None
