from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Tweet(Base):
    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    tweet_id = Column(String, unique=True, index=True, nullable=False)  # Twitter's tweet ID
    posted_at = Column(DateTime(timezone=True), nullable=False)
    type = Column(String, default="tweet")  # "tweet" or "reply"

    # Analytics (updated from Twitter API)
    likes_count = Column(Integer, default=0)
    retweets_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    quotes_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="tweets")

    def __repr__(self):
        return f"<Tweet(id={self.id}, user_id={self.user_id}, tweet_id={self.tweet_id})>"
