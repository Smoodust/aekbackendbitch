from flask import Flask
from flask import request
from functions import *

players = {}
lobbys = {}

app = Flask(__name__)

@app.post("/player/")
def add_player():
    name = request.form.get('name')
    token = generate_unique_text(20, [x.token for x in players])
    players[token] = Player(name, token)
    app.logger.debug(players)
    return token

@app.post("/lobby/")
def add_lobby():
    token_creator = request.form.get('token_creator')
    code = generate_unique_text(5, [x.code for x in lobbys])
    lobbys[code] = Lobby(code, [token_creator])
    app.logger.debug(lobbys)
    return code

@app.get("/player/invite/")
def invite_player():
    token = request.args.get('token')
    code = request.args.get('code')

    if code in lobbys:
        lobbys[code].members.append(token)
        app.logger.debug(lobbys)
        return 'OK'
    return 'DONT FIND'