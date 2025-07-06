from fastapi import FastAPI
from routers import auth, transactions
from fastapi.middleware.cors import CORSMiddleware
from databases.database import Base, engine
import os
from dotenv import load_dotenv
load_dotenv()  

Base.metadata.create_all(bind=engine)
app = FastAPI()

origins = os.getenv("CORS_ORIGINS", "")
origins = [origin.strip() for origin in origins.split(",") if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])