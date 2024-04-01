from pydantic import BaseSettings


class Settings(BaseSettings):
    DB_USERNAME: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str

    def get_db_uri(self) -> str:
        uri = f"postgresql://{self.DB_USERNAME}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

        return uri


settings = Settings()
