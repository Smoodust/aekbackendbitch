from flask import Flask, request
from flask_socketio import SocketIO, join_room, leave_room, emit
from functions import *
from json import *

players = {}
lobbys = {}

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.post("/player/")
def add_player():
    name = request.form.get('name')
    token = generate_unique_text(20, [x.token for x in players])
    players[token] = Player(name, token, False)
    app.logger.debug(players)
    return token

@app.post("/lobby/")
def add_lobby():
    code = generate_unique_text(5, [x.code for x in lobbys])
    lobbys[code] = Lobby(code, LobbyStatus.waiting, [])
    app.logger.debug(lobbys)
    return code

@socketio.on('join')
def on_join(data):
    token = data['token']
    code = data['code']
    join_room(code)
    emit('user_joined', {
        'token':token,
        'nickname':players[token].nickname,
        'toRoom':code
    }, to=code)
    emit('lobby_members_info', [
        players[member_token].nickname for member_token in lobbys.member
    ])

@socketio.on('leave')
def on_leave(data):
    token = data['token']
    code = data['code']
    leave_room(room)
    players[token].isActive = False
    emit('user_leaved', {
        'token':token,
        'nickname':players[token].nickname,
        'toRoom':code
    }, to=code)

if __name__ == '__main__':
    socketio.run(app)