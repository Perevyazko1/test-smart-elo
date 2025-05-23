from datetime import datetime
from typing import List

from pydantic import BaseModel
from typing_extensions import Optional


class UserSchema(BaseModel):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    patronymic: Optional[str]
    email: Optional[str]
    email_confirmed: Optional[bool]
    phone_number: Optional[str]
    registered_at: Optional[datetime]
    is_active: Optional[bool]
    is_superuser: Optional[bool]

    class Config:
        from_attributes = True

