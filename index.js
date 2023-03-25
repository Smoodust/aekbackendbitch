let nanoid = import('nanoid');

const express = require("express")
const socketIo = require("socket.io")
const http = require("http")
const PORT = process.env.PORT || 5000
const app = express()
const server = http.createServer(app)
const io = socketIo(server,{ 
    cors: {
        origin: "http://localhost:3000"
    }
})

function handleGame(state, socket) {
    const code = state.code;
    if (state.status == "ready") {
        lobbys[code].status = "ready";
        if (lobbys[code].minigames.length > 0)
        {
            socket.to(code).emit("ready to game", Date.now() + 3000);
            socket.emit("ready to game", Date.now() + 3000);
            setTimeout(() => { 
                handleGame({
                    state: "choosing cards",
                    code: code
                }, socket); 
            }, 3000);
        } else {
            socket.to(code).emit("ready to scoreboard", Date.now() + 3000);
            socket.emit("ready to scoreboard", Date.now() + 3000);
        }
    } else if (state.status == "choosing cards") {
        socket.to(code).emit("choose cards", {
            cards: [...lobbys[code].minigames],
            dateToEnd: Date.now() + 10000
        });
        socket.emit("choose cards", {
            cards: [...lobbys[code].minigames],
            dateToEnd: Date.now() + 10000
        });
        setTimeout(() => { 
            handleGame({
                state: "end of choosing",
                code: code
            }, socket); 
        }, 10000);
    } else if (state.status == "end of choosing") {
        let [maxCount, maxCountElement] = [0, lobbys[code].minigames[0]];
        counts = {}
        for (const [key, value] in Object.entries(lobbys[code].chooseCards)) {
            console.log(counts, maxCount, maxCountElement, value);
            counts[value] = counts[value] ? counts[value] + 1 : 1;
                if (counts[value] > maxCount) {
                    maxCount = counts[value];
                    maxCountElement = value;
                }
        }
        socket.to(code).emit("start the game", {
            game: maxCountElement,
            dateToEnd: Date.now() + 10000
        });
        socket.emit("start the game", {
            game: maxCountElement,
            dateToEnd: Date.now() + 10000
        });
        setTimeout(() => { 
            handleGame({
                state: "end of minigame",
                currentGame: maxCountElement,
                code: code
            }, socket); 
        }, 10000);
    } else if (state.status == "end of minigame") {

    }
}

let players = {};
let lobbys = {};

io.on("connection", (socket) => {
    console.log("client connected: ", socket.id);

    socket.on("create player", (nickname, callback) => {
        nanoid.then(module => {
            let token = module.nanoid();
            players[token] = {
                nickname: nickname,
                token: token,
                isActive: false
            };
            console.log("player created: ", nickname, " ", token);
            callback({
                status: "OK",
                token: token
            });
        });
    });

    socket.on("create lobby", (callback) => {
        nanoid.then(module => {
            let code = module.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6)();
            lobbys[code] = {
                status: "waiting",
                code: code,
                membersA: new Set(),
                membersB: new Set(),
                minigames: new Set(),
                chooseCards: {}
            };
            for (const x in ["guees", "arithmetic"]) {
                lobbys[code].minigames.add(x)
            }
            callback({
                status: "OK",
                code: code
            });
    
            console.log("lobby created: ", code);
        });
    });

    socket.on("join to room", (data, callback) => {
        let code = data.code;
        let token = data.token;

        if (token in players && code in lobbys)
        {
            socket.join(code);
            if (lobbys[code].membersA.size > lobbys[code].membersB.size) {
                lobbys[code].membersB.add(token);
            } else {
                lobbys[code].membersA.add(token);
            }

            payload = {
                membersA: [...lobbys[code].membersA].map(x => players[x].nickname),
                membersB: [...lobbys[code].membersB].map(x => players[x].nickname)
            }
            socket.to(code).emit("members update", payload);
            payload['status'] = 'OK';
            callback(payload);

            console.log(token, " joined to ", code);
        } else {
            console.log(token in players, code in lobbys)
            callback({
                status: "ERROR"
            });
        }
    });

    socket.on("choosed card", (token, code, game) => {
        lobbys[code].chooseCards[token] = game;
    });

    socket.on("set ready to game", (token, code) => {
        players[token].isActive = true;
        console.log(token, "is ready");
        if ([...lobbys[code].membersA].reduce((accumulator, currentValue) => { return players[currentValue].isActive && accumulator; }, true) && [...lobbys[code].membersB].reduce((accumulator, currentValue) => { return players[currentValue].isActive && accumulator; }, true)) {
            handleGame({
                status: "ready",
                code: code
            }, socket);
            console.log(token, "is ready");
        }
    });

    socket.on("", (callback) => {
        
    });

    socket.on("asd", (callback) => {
        
    });
  
    socket.on("disconnect", (reason) => {
        console.log(reason);
    });
})

server.listen(PORT, err => {
    if(err) {
        console.log(err)
    }
    console.log("Server running on Port ", PORT)
})