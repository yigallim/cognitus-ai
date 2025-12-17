from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .utils import decode_token
from .service import auth_service
from .schemas import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    email = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = await auth_service.get_user_by_email(email)
    if user is None:
        raise credentials_exception
        
    return User(**user.model_dump())
