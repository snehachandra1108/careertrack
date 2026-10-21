from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class JobApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=150)
    role: str = Field(min_length=1, max_length=150)
    applied_date: date
    status: str = Field(default="Applied", max_length=30)
    notes: str | None = None


class JobApplicationUpdate(BaseModel):
    company: str | None = Field(default=None, min_length=1, max_length=150)
    role: str | None = Field(default=None, min_length=1, max_length=150)
    applied_date: date | None = None
    status: str | None = Field(default=None, max_length=30)
    notes: str | None = None


class JobApplicationResponse(JobApplicationCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
