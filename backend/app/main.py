from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import get_engine
from . import models
from .routers import event_types, availability, bookings
from .seed import seed

app = FastAPI(
    title="Schedulo API",
    description="A Calendly-clone scheduling platform API",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(event_types.router)
app.include_router(availability.router)
app.include_router(bookings.router)


@app.on_event("startup")
def startup_event():
    # Initialize database connection and create tables
    engine = get_engine()
    models.Base.metadata.create_all(bind=engine)
    # Run seed data
    seed()


@app.get("/")
def root():
    return {"message": "Schedulo API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
