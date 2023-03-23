import random, string

def randomword(length):
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))

players = []

def add_player(name):
    token = randomword(20)
    while token in [x['token'] for x in players]:
        token = randomword(20)
    
    player = {
        "name":name,
        "token":token
    }
    players.append(player)
    return player 

add_player("John")
add_player("asdadn")
add_player("Jsdasn")
add_player("Joasdsdn")
print(players)