from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

from app.db import Base, engine, get_db
from app.models import User

app = FastAPI()


Base.metadata.create_all(bind=engine)


@app.get("/healthcheck")
def healthcheck():
    return "OK"


@app.get("/user")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


@app.post("/user")
def add_user(username: str, db: Session = Depends(get_db)):
    user = User(username=username)
    db.add(user)
    db.commit()
