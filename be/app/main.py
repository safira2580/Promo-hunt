from fastapi import FastAPI

from app.routes.user_routes import router

from app.config.database import Base
from app.config.database import engine

# ==========================================
# CREATE TABLES
# ==========================================
Base.metadata.create_all(bind=engine)

# ==========================================
# FASTAPI
# ==========================================
app = FastAPI(
    title="API ADSO SENA",
    version="1.0.0"
)

# ==========================================
# ROUTES
# ==========================================
app.include_router(router)

# ==========================================
# HOME
# ==========================================
@app.get("/")
def home():
    return {
        "success": True,
        "message": "API funcionando correctamente"
    }