from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class PostStatus(enum.Enum):
    PENDING = "pending"
    POSTED = "posted"
    FAILED = "failed"


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(PostStatus), default=PostStatus.PENDING)
    tweet_id = Column(String, nullable=True)  # Twitter's tweet ID after posting

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="scheduled_posts")

    def __repr__(self):
        return f"<ScheduledPost(id={self.id}, user_id={self.user_id}, status={self.status})>"
