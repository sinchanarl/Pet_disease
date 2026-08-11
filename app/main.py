from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.v1 import pets
from app.routers.v1.health import router as health_router
from app.routers.v1.kb import router as kb_router
from app.routers.v1.scans import router as scans_router
from app.routers.v1.pets_entity import router as pets_entity_router
from app.routers.v1.vision import router as vision_router
from app.routers.v1.recommendations import router as recommendations_router
from app.routers.v1.stats import router as stats_router
from app.routers.v1.diagnosis import router as diagnosis_router

from app.config.settings import settings
from app.utils.db_init import engine
from app.models.pet_scan import Base
# Import models to register them with Base.metadata
from app.models.pet_kb import PetKB 
from app.models.pet import Pet
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS — allow frontend dev server and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to create tables
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    logging.info("Database tables created/verified.")

# Include Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(kb_router, prefix=settings.API_V1_STR)
app.include_router(scans_router, prefix=settings.API_V1_STR)
app.include_router(vision_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(diagnosis_router, prefix=settings.API_V1_STR)
app.include_router(pets_entity_router, prefix=settings.API_V1_STR)
# Existing scan router
app.include_router(pets.router, prefix=f"{settings.API_V1_STR}/pets", tags=["Scan"])

@app.get("/")
async def root():
    return {"message": "Welcome to Pet Disease Detection Service API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
