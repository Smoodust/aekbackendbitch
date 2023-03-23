import random, string
from base import *

def randomword(length):
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))

def generate_unique_text(length, list_to_check):
    text = randomword(length)
    while text in [x for x in list_to_check]:
        text = randomword(length)
    return text