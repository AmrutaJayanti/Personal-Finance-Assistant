from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.models import User
from databases.database import get_db
from dotenv import load_dotenv
import os
load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")    # Secret key for JWT encoding/decoding
ALGORITHM = os.getenv("ALGORITHM")      # Algorithm used for JWT encoding/decoding
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))  # Token expiration time in minutes 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")   # Password hashing context using bcrypt
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")        # OAuth2 scheme for token-based authentication

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
        return db.query(User).filter(User.username == username).first()
    except JWTError:
        raise HTTPException(status_code=401)