from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.chatbot.query_executor import execute_query

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str


@router.post("")
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = execute_query(
        db=db,
        message=data.message,
        user_id=current_user.id,
        role=current_user.role.value if hasattr(current_user.role, 'value') else current_user.role,
        staff_id=current_user.id
    )
    return {"reply": result["reply"], "intent": result["intent"]}