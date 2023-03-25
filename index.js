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
    console.log(state);
    if (state.status == "ready") {
        console.log(lobbys[code]);
        lobbys[code].status = "ready";
        if (lobbys[code].minigames.size > 0)
        {
            socket.to(code).emit("ready to game", Date.now() + 3000);
            socket.emit("ready to game", Date.now() + 3000);
            setTimeout(() => { 
                handleGame({
                    status: "choosing cards",
                    code: code
                }, socket); 
            }, 3000);
        } else {
            socket.to(code).emit("ready to scoreboard", Date.now() + 3000);
            socket.emit("ready to scoreboard", Date.now() + 3000);
            setTimeout(() => { 
                handleGame({
                    status: "end game",
                    code: code
                }, socket);
            });
        }
    } else if (state.status == "choosing cards") {
        console.log("choosing cards");
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
                status: "end of choosing",
                code: code
            }, socket); 
        }, 10000);
    } else if (state.status == "end of choosing") {
        let maxCount = 0;
        let maxCountElement = "";
        console.log(maxCountElement);
        counts = {}
        for (const key in lobbys[code].chooseCards) {
            let value = lobbys[code].chooseCards[key];
            console.log(value)
            counts[value] = counts[value] ? counts[value] + 1 : 1;
            if (counts[value] > maxCount) {
                maxCount = counts[value];
                maxCountElement = value;
            }
        }
        console.log(counts, maxCount, maxCountElement)
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
                status: "end of minigame",
                currentGame: maxCountElement,
                code: code
            }, socket); 
        }, 10000);
    } else if (state.status == "end of minigame") {
        let scoresA = 0;
        let scoresB = 0;
        for (const token in lobbys[code].gameInfo) {
            if (lobbys[code].membersA.has(token)) {
                scoresA = lobbys[code].gameInfo[token];
            }
            if (lobbys[code].membersB.has(token)) {
                scoresB = lobbys[code].gameInfo[token];
            }
        }
        if (scoresA >= scoresB) {
            lobbys[code].scoreA = lobbys[code].scoreA + 1;
        }
        if (scoresA <= scoresB) {
            lobbys[code].scoreB = lobbys[code].scoreB + 1;
        }
        lobbys[code].minigames.delete(state.currentGame);
        socket.to(code).emit("end of minigame", {
            scoreA:lobbys[code].scoreA,
            scoreB:lobbys[code].scoreB,
            dateToEnd: Date.now() + 5000
        });
        socket.emit("end of minigame", {
            scoreA:lobbys[code].scoreA,
            scoreB:lobbys[code].scoreB,
            dateToEnd: Date.now() + 5000
        });
        setTimeout(() => { 
            handleGame({
                status: "ready",
                code: code
            }, socket); 
        }, 1000);
    } else if (state.status == "end game") {

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
                chooseCards: {},
                gameInfo: {},
                scoreA: 0,
                scoreB: 0
            };
            ["guees", "arithmetic"].forEach(x => lobbys[code].minigames.add(x));
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
        console.log(token, code);
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

    socket.on("update score", (token, code, score) => {
        lobbys[code].gameInfo[token] = score;
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