from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from src.schedules.background import lifespan, get_recommended

app = FastAPI(title="CF Service - API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
async def index():
    return RedirectResponse(url="/docs")

@app.get("/{user_id}")
def get_cf(user_id: str) -> list:
    items = []
    recommended = get_recommended()
    for i in recommended:
        try:
            if i.get('users').index(user_id) is not None:
                items.append(i.get('item'))
        except:
            continue

    return items