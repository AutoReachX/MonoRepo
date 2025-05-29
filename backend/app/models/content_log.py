from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class ContentLog(Base):
    __tablename__ = "content_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt = Column(Text, nullable=False)
    generated_text = Column(Text, nullable=False)
    mode = Column(String, nullable=False)  # "new_tweet", "reply", "thread"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="content_logs")

    def __repr__(self):
        return f"<ContentLog(id={self.id}, user_id={self.user_id}, mode={self.mode})>"
