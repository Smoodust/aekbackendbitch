from flask import Flask
from flask import request
from functions import *

players = []
lobbys = []

app = Flask(__name__)

@app.route("/player/")
def add_player():
    name = request.args.get('name')
    token = generate_unique_text(20, [x.token for x in players])
    players.append(Player(name, token))
    return token

@app.route("/lobby/")
def add_lobbys():
    token_creator = request.args.get('token_creator')
    code = generate_unique_text(5, [x.code for x in lobbys])
    lobbys.append(Lobby(code, [token_creator]))
    return code

@app.route("/player/invite/")
def invite_player(token, code):
    token = request.args.get('token')
    code = request.args.get('code')
    for lobby in lobbys:
        if lobby.code == code:
            lobby.members.append(token)
            return 'OK'
    return 'DONT FIND'