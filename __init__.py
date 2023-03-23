import random, string

def randomword(length):
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))

def generate_unique_text(length, list_to_check):
    text = randomword(length)
    while text in [x for x in list_to_check]:
        text = randomword(length)
    return text

players = []
lobbys = []

def add_player(name):
    token = generate_unique_text(20, [x['token'] for x in players])
    
    players.append({
        "name":name,
        "token":token
    })
    return token

def add_lobbys(token_creator):
    code = generate_unique_text(5, [x['code'] for x in lobbys])

    lobby = {
        "code": code,
        "members": [token_creator]
    }
    lobbys.append(lobby)
    return code

def invite_player(token, code):
    for lobby in lobbys:
        if lobby['code'] == code:
            lobby['members'].append(token)
            return 'OK'
    return 'DONT FIND'

token = add_player("John")
code = add_lobbys(token)
invite_player(add_player("asdadn"), code)
invite_player(add_player("Jsdasn"), code)
invite_player(add_player("Joasdsdn"), code)
print(players)
print(lobbys)