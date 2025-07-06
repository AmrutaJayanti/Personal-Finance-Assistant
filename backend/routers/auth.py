from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
from schemas.user import UserCreate, LoginRequest
from models.models import User
from utils.auth import hash_password, verify_password, create_access_token


# This file defines the authentication routes for user registration and login.
# It includes endpoints for registering a new user and logging in an existing user.
#Token based authentication is implemented using JWT (JSON Web Tokens).

router = APIRouter()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists") # Check if user already exists
    new_user = User(
        username=user.username,
        email=user.email,                          #Add new user to the database
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered"}

@router.post("/login")     
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):    # Verify user credentials
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token({"sub": db_user.username})     # Create access token for the user
    return {"access_token": token, "token_type": "bearer"}