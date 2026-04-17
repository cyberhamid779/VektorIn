import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users, posts, connections, messages, admin, certificates, upload, projects, events

app = FastAPI(title="VektorIn API", version="1.0.0")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(connections.router)
app.include_router(messages.router)
app.include_router(admin.router)
app.include_router(certificates.router)
app.include_router(upload.router)
app.include_router(projects.router)
app.include_router(events.router)


@app.get("/")
def root():
    return {"message": "VektorIn API işləyir"}
