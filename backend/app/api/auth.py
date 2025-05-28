from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.services.twitter_service import TwitterService

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Twitter OAuth Models
class TwitterAuthResponse(BaseModel):
    authorization_url: str
    oauth_token: str
    oauth_token_secret: str

class TwitterCallbackRequest(BaseModel):
    oauth_token: str
    oauth_verifier: str

# Twitter OAuth Endpoints
@router.get("/twitter/login")
async def twitter_login(current_user: User = Depends(get_current_user)):
    """Initiate Twitter OAuth flow"""
    twitter_service = TwitterService(
        api_key=settings.TWITTER_API_KEY,
        api_secret=settings.TWITTER_API_SECRET
    )

    callback_url = f"{settings.FRONTEND_URL}/auth/twitter/callback"
    result = twitter_service.get_oauth_url(callback_url)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get Twitter authorization URL: {result['error']}"
        )

    # Store oauth_token_secret in session or database for later use
    # For now, we'll return it to the frontend to handle
    return TwitterAuthResponse(
        authorization_url=result["authorization_url"],
        oauth_token=result["oauth_token"],
        oauth_token_secret=result["oauth_token_secret"]
    )

@router.post("/twitter/callback")
async def twitter_callback(
    callback_data: TwitterCallbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle Twitter OAuth callback"""
    twitter_service = TwitterService(
        api_key=settings.TWITTER_API_KEY,
        api_secret=settings.TWITTER_API_SECRET
    )

    # Exchange OAuth verifier for access tokens
    result = twitter_service.get_access_tokens(
        oauth_token=callback_data.oauth_token,
        oauth_token_secret="",  # We need to retrieve this from session/storage
        oauth_verifier=callback_data.oauth_verifier
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get Twitter access tokens: {result['error']}"
        )

    # Update user with Twitter credentials
    current_user.twitter_access_token = result["access_token"]
    current_user.twitter_refresh_token = result["access_token_secret"]  # Note: OAuth 1.0a uses access_token_secret

    # Get Twitter user info
    try:
        user_client = TwitterService(
            api_key=settings.TWITTER_API_KEY,
            api_secret=settings.TWITTER_API_SECRET,
            access_token=result["access_token"],
            access_token_secret=result["access_token_secret"]
        )
        user_info = user_client.get_current_user_info()
        if user_info and user_info.get("success"):
            current_user.twitter_user_id = str(user_info["data"]["id"])
            current_user.twitter_username = user_info["data"]["username"]
    except Exception as e:
        # Log error but don't fail the authentication
        print(f"Failed to get Twitter user info: {e}")

    db.commit()

    return {
        "message": "Twitter account connected successfully",
        "twitter_username": current_user.twitter_username,
        "twitter_user_id": current_user.twitter_user_id
    }

@router.delete("/twitter/disconnect")
async def disconnect_twitter(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect Twitter account"""
    current_user.twitter_access_token = None
    current_user.twitter_refresh_token = None
    current_user.twitter_user_id = None
    current_user.twitter_username = None
    db.commit()

    return {"message": "Twitter account disconnected successfully"}

@router.get("/twitter/status")
async def twitter_status(current_user: User = Depends(get_current_user)):
    """Check Twitter connection status"""
    is_connected = bool(
        current_user.twitter_access_token and
        current_user.twitter_refresh_token
    )

    return {
        "connected": is_connected,
        "twitter_username": current_user.twitter_username if is_connected else None,
        "twitter_user_id": current_user.twitter_user_id if is_connected else None
    }
