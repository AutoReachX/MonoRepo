from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Twitter OAuth data (primary authentication method)
    twitter_user_id = Column(String, unique=True, index=True, nullable=False)
    twitter_username = Column(String, unique=True, index=True, nullable=False)
    twitter_access_token = Column(Text, nullable=False)  # Encrypted in production
    twitter_refresh_token = Column(Text)
    token_expiry = Column(DateTime(timezone=True))

    # User preferences
    language_pref = Column(String, default="en")
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    scheduled_posts = relationship("ScheduledPost", back_populates="user")
    content_logs = relationship("ContentLog", back_populates="user")
    tweets = relationship("Tweet", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, twitter_username={self.twitter_username})>"
