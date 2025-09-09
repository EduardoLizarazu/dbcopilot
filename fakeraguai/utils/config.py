
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class OracleSettings:
    user: str = os.getenv("ORACLE_USER", "TMPRD")
    password: str = os.getenv("ORACLE_PASSWORD", "TMPRD")
    host: str = os.getenv("ORACLE_HOST", "localhost")
    port: int = int(os.getenv("ORACLE_PORT", "1521"))
    service: str = os.getenv("ORACLE_SERVICE", "orclaguai")

    def sqlalchemy_url(self) -> str:
        return f"oracle+oracledb://{self.user}:{self.password}@{self.host}:{self.port}/?service_name={self.service}"

ORACLE = OracleSettings()
