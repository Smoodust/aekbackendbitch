from dataclasses import dataclass
from typing import List, Dict, Any
from enum import Enum

class LobbyStatus(Enum):
    waiting = 1
    choosing = 2
    typing = 3
    arithmetic = 4

@dataclass
class Player:
    nickname: str
    token: str

@dataclass
class Lobby:
    code: str
    status: LobbyStatus
    members: List[Dict[str, Any]]
