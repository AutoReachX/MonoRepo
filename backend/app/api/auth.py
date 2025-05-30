from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import secrets
import hashlib
import base64
import urllib.parse
import httpx

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
    """Get current user information"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "twitter_username": current_user.twitter_username,
        "twitter_user_id": current_user.twitter_user_id,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None
    }

# Twitter OAuth Models


class TwitterAuthResponse(BaseModel):
    authorization_url: str
    oauth_token: str
    oauth_token_secret: str


class TwitterCallbackRequest(BaseModel):
    oauth_token: str
    oauth_verifier: str
    oauth_token_secret: str  # Add this field

# Twitter OAuth 2.0 Models for User Authentication


class TwitterOAuth2InitRequest(BaseModel):
    redirect_uri: str = "http://localhost:3000/auth/twitter/callback"


class TwitterOAuth2InitResponse(BaseModel):
    authorization_url: str
    state: str
    code_verifier: str


class TwitterOAuth2CallbackRequest(BaseModel):
    code: str
    state: str
    code_verifier: str


class TwitterOAuth2CallbackResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Helper functions for OAuth 2.0 PKCE


def generate_code_verifier() -> str:
    """Generate a code verifier for PKCE"""
    return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')


def generate_code_challenge(code_verifier: str) -> str:
    """Generate a code challenge from code verifier"""
    digest = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')

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
        oauth_token_secret=callback_data.oauth_token_secret,
        oauth_verifier=callback_data.oauth_verifier
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Darn, Failed to get Twitter access tokens: {result['error']}"
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


@router.get("/twitter/status")
async def get_twitter_status(current_user: User = Depends(get_current_user)):
    """Get Twitter connection status"""
    return {
        "connected": bool(current_user.twitter_access_token),
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

# Twitter OAuth 2.0 User Authentication Endpoints


@router.get("/oauth2/twitter/debug")
async def twitter_oauth2_debug():
    """Debug endpoint to check Twitter OAuth 2.0 configuration"""
    return {
        "client_id": settings.TWITTER_CLIENT_ID[:10] + "..." if settings.TWITTER_CLIENT_ID else "NOT_SET",
        "client_secret": "SET" if settings.TWITTER_CLIENT_SECRET else "NOT_SET",
        "bearer_token": "SET" if settings.TWITTER_BEARER_TOKEN else "NOT_SET",
        "redirect_uri": settings.TWITTER_OAUTH_REDIRECT_URI,
        "frontend_url": settings.FRONTEND_URL
    }


@router.post("/oauth2/twitter/init")
async def twitter_oauth2_init(request: TwitterOAuth2InitRequest):
    """Initialize Twitter OAuth 2.0 flow for user authentication"""
    try:
        # Check if required credentials are set
        if not settings.TWITTER_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Twitter Client ID not configured"
            )

        if not settings.TWITTER_CLIENT_SECRET:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Twitter Client Secret not configured"
            )

        # Generate PKCE parameters
        code_verifier = generate_code_verifier()
        code_challenge = generate_code_challenge(code_verifier)
        state = secrets.token_urlsafe(32)

        # Build authorization URL
        params = {
            'response_type': 'code',
            'client_id': settings.TWITTER_CLIENT_ID,
            'redirect_uri': request.redirect_uri,
            'scope': 'tweet.read users.read offline.access',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }

        authorization_url = f"https://twitter.com/i/oauth2/authorize?{urllib.parse.urlencode(params)}"

        return TwitterOAuth2InitResponse(
            authorization_url=authorization_url,
            state=state,
            code_verifier=code_verifier
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Twitter OAuth 2.0: {str(e)}"
        )


@router.post("/oauth2/twitter/callback")
async def twitter_oauth2_callback(
    callback_data: TwitterOAuth2CallbackRequest,
    db: Session = Depends(get_db)
):
    """Handle Twitter OAuth 2.0 callback and authenticate/create user"""
    try:
        # Exchange authorization code for access token
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.TWITTER_CLIENT_ID,
            'client_secret': settings.TWITTER_CLIENT_SECRET,
            'code': callback_data.code,
            'redirect_uri': settings.TWITTER_OAUTH_REDIRECT_URI,
            'code_verifier': callback_data.code_verifier
        }

        async with httpx.AsyncClient() as client:
            # Get access token
            token_response = await client.post(
                'https://api.twitter.com/2/oauth2/token',
                data=token_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )

            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to get access token: {token_response.text}"
                )

            token_info = token_response.json()
            access_token = token_info['access_token']

            # Get user info from Twitter
            user_response = await client.get(
                'https://api.twitter.com/2/users/me',
                headers={'Authorization': f'Bearer {access_token}'}
            )

            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to get user info: {user_response.text}"
                )

            twitter_user = user_response.json()['data']

            # Check if user exists
            existing_user = db.query(User).filter(
                User.twitter_user_id == str(twitter_user['id'])
            ).first()

            if existing_user:
                # Update existing user's tokens
                existing_user.twitter_access_token = access_token
                existing_user.twitter_username = twitter_user['username']
                if 'refresh_token' in token_info:
                    existing_user.twitter_refresh_token = token_info['refresh_token']
                db.commit()
                user = existing_user
            else:
                # Create new user
                new_user = User(
                    twitter_user_id=str(twitter_user['id']),
                    twitter_username=twitter_user['username'],
                    twitter_access_token=access_token,
                    twitter_refresh_token=token_info.get('refresh_token'),
                    username=twitter_user['username'],  # Use Twitter username as fallback
                    full_name=twitter_user.get('name', twitter_user['username']),
                    is_active=True
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                user = new_user

            # Create JWT token for our application
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            jwt_token = create_access_token(
                data={"sub": user.username},
                expires_delta=access_token_expires
            )

            return TwitterOAuth2CallbackResponse(
                access_token=jwt_token,
                token_type="bearer",
                user={
                    "id": user.id,
                    "username": user.username,
                    "twitter_username": user.twitter_username,
                    "twitter_user_id": user.twitter_user_id,
                    "full_name": user.full_name,
                    "is_active": user.is_active
                }
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )
