from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie

from .schemas import Token, LoginRequest, User, LoginResponse
from .service import auth_service
from .utils import create_access_token, create_refresh_token, decode_token
from .dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, response: Response):
    user = await auth_service.authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    await auth_service.store_refresh_token(refresh_token, user.email)
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # Set to True if using HTTPS
        samesite="lax"
    )

    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(response: Response, refresh_token: Annotated[str | None, Cookie()] = None):
    token = refresh_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    payload = decode_token(token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    email = payload.get("sub")
    if not isinstance(email, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: email missing or not a string",
        )
    
    if not await auth_service.is_refresh_token_valid(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or is invalid",
        )

    await auth_service.revoke_refresh_token(token)
    new_access_token = create_access_token(data={"sub": email})
    new_refresh_token = create_refresh_token(data={"sub": email})
    await auth_service.store_refresh_token(new_refresh_token, email)
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="lax"
    )

    return {
        "access_token": new_access_token, 
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(response: Response, refresh_token: Annotated[str | None, Cookie()] = None):
    if refresh_token:
        await auth_service.revoke_refresh_token(refresh_token)
    
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
