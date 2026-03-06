from sqlalchemy.orm import Session
from app.chatbot.intent_classifier import classify_intent
from app.chatbot.admin_queries import handle_admin_intent
from app.chatbot.staff_queries import handle_staff_intent
from app.models.user import UserRole


def execute_query(db: Session, message: str, user_id: int, role: str, staff_id: int = None) -> dict:
    intent = classify_intent(message)

    if role == UserRole.admin.value:
        reply = handle_admin_intent(db, intent, message)
    else:
        reply = handle_staff_intent(db, intent, message, staff_id or user_id)

    return {
        "reply": reply,
        "intent": intent
    }