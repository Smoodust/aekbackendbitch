import eventlet
import socketio
from functions import *
import eventlet

players = dict()
lobbys = dict()

sio = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')
app = socketio.WSGIApp(sio)

@sio.event
def connect(sid, environ):
    print('connect ', sid)

@sio.on('create_player')
def on_create_player(sid, nickname):
    token = generate_unique_text(20, [token for token, _ in players.items()])
    players[token] = Player(nickname, token, False)
    print(nickname, 'user created')
    print({"status": "OK", "token": token})
    return {"status": "OK", "token": token}

@sio.on('create_lobby')
def on_create_lobby(sid):
    code = generate_unique_text(5, [code for code, _ in lobbys.items()])
    lobbys[code] = Lobby(code, LobbyStatus.waiting, [])
    print(code, 'lobby created')
    return {"status": "OK", "code": code}

@sio.on('join_to_room')
def on_join(sid, data):
    token = data.get('token')
    code = data.get('code')
    lobbys[token].members.append(token)
    print(token, 'user joined to', code)
    return "OK"

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)