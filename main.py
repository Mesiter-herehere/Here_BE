from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URL = "mongodb+srv://shinhuiseong07:siniseong@herehere.gnb7p2m.mongodb.net/?retryWrites=true&w=majority&appName=herehere"
client = MongoClient(MONGODB_URL)
db = client.shinhuiseong07 
collection = db.users

class User(BaseModel):
    school: str
    name: str
    email: str
    password: str

@app.post("/api/signup")
async def signup(user: User):
    try:
        user_dict = user.dict()
        result = collection.insert_one(user_dict)
        
        if result.inserted_id:
            return {"status": "success", "message": "사용자가 성공적으로 등록되었습니다."}
        else:
            raise HTTPException(status_code=500, detail="사용자 등록에 실패했습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
