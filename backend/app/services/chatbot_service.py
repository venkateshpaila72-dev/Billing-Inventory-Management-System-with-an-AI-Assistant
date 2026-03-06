from sqlalchemy.orm import Session
from app.chatbot.query_executor import execute_query
from app.models.user import User


def process_chat(db: Session, message: str, current_user: User) -> dict:
    if not message or not message.strip():
        return {
            "reply": "Please type a message.",
            "intent": "empty"
        }

    staff_id = current_user.id if current_user.role.value == "staff" else None

    return execute_query(
        db=db,
        message=message.strip(),
        user_id=current_user.id,
        role=current_user.role.value,
        staff_id=staff_id
    )