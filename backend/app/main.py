from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.database import Base, engine, get_db
from backend.app.models import JobApplication
from backend.app.schemas import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
)
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CareerTrack API",
    description="Student placement and career preparation tracker",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def root():
    return {"message": "Welcome to CareerTrack", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "application": "CareerTrack"}


@app.post(
    "/applications",
    response_model=JobApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Applications"],
)
def create_application(
    payload: JobApplicationCreate,
    db: Session = Depends(get_db),
):
    application = JobApplication(**payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@app.get(
    "/applications",
    response_model=list[JobApplicationResponse],
    tags=["Applications"],
)
def list_applications(db: Session = Depends(get_db)):
    return db.scalars(
        select(JobApplication).order_by(JobApplication.id.desc())
    ).all()


@app.get(
    "/applications/{application_id}",
    response_model=JobApplicationResponse,
    tags=["Applications"],
)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@app.patch(
    "/applications/{application_id}",
    response_model=JobApplicationResponse,
    tags=["Applications"],
)
def update_application(
    application_id: int,
    payload: JobApplicationUpdate,
    db: Session = Depends(get_db),
):
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application


@app.delete(
    "/applications/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Applications"],
)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.get(JobApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    db.delete(application)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
