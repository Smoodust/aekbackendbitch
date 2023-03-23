import random, string

def randomword(length):
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))

def generate_token():
    token = randomword(20)
    while token in [x['token'] for x in players]:
        token = randomword(20)
    return token

players = []

def add_player(name):
    token = generate_token()
    
    players.append({
        "name":name,
        "token":token
    })
    return token


add_player("John")
add_player("asdadn")
add_player("Jsdasn")
add_player("Joasdsdn")
print(players)