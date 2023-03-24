@socket_.on('join')
def on_join(data):
    token = data['token']
    code = data['code']
    join_room(code)
    print('SOCKETIO BITCH')
    emit('lobby_members_info', [
        players[member_token].nickname for member_token in lobbys.member
    ], to=code)

@socket_.on('leave')
def on_leave(data):
    token = data['token']
    code = data['code']
    leave_room(code)
    players[token].isActive = False
    emit('lobby_members_info', [
        players[member_token].nickname for member_token in lobbys.member
    ], to=code)

import socketio
#from flask_cors import CORS
from functions import *

players = {}
lobbys = {}

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

sio = socketio.Server()

@app.post("/api/player")
def add_player():
    name = request.json.get('name')
    token = generate_unique_text(20, [x.token for _, x in players.items()])
    players[token] = Player(name, token, False)
    return {
        'token':token
    }

@app.post("/api/lobby")
def add_lobby():
    code = generate_unique_text(5, [x.code for _, x in lobbys.items()])
    lobbys[code] = Lobby(code, LobbyStatus.waiting, [])
    return {'code':code}



if __name__ == '__main__':
    socketio.init_app(app, cors_allowed_origins="*")
    socketio.run(app, port=5000, debug=True)