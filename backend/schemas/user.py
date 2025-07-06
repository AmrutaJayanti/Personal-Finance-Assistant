from pydantic import BaseModel

# This file defines the schemas for user-related data, including user creation and login requests.

class UserCreate(BaseModel):
    username: str
    email: str
    password: str



class LoginRequest(BaseModel):
    username: str
    password: str