from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: str
    reason: Optional[str] = None


class AdminResetPasswordRequest(BaseModel):
    staff_id: int
    new_password: str


class PasswordResetRequestResponse(BaseModel):
    id: int
    staff_id: int
    staff_name: str
    staff_email: str
    reason: Optional[str]
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True