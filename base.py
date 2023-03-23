from dataclasses import dataclass
from typing import List

@dataclass
class Player:
    """Class for keeping track of player"""
    nickname: str
    token: str

@dataclass
class Lobby:
    """Class for keeping track of player"""
    code: str
    members: List[str]
