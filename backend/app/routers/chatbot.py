from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import process_chat
from app.models.user import User

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return process_chat(db, request.message, current_user)