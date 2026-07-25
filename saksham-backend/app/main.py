from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routers import chat, documents

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # creates tables if they don't exist yet
    yield


app = FastAPI(title="Saksham API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
