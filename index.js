const { v4: uuidv4 } = require('uuid');

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

function getRandomName() {
    let hexString = uuidv4();
    console.log("hex:   ", hexString);
    
    // remove decoration
    hexString = hexString.replace(/-/g, "");
    
    let base64String = Buffer.from(hexString, 'hex').toString('base64')
    console.log("base64:", base64String);
    
    return base64String;
}

let players = {};
let lobbys = {};

io.on("connection", (socket) => {
    console.log("client connected: ", socket.id);

    socket.on("create player", (nickname, callback) => {
        let token = uuidv4();
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

    socket.on("create lobby", (callback) => {
        let code = getRandomName();
        lobbys[code] = {
            status: "waiting",
            code: code,
            members: new Set()
        };
        callback({
            status: "OK",
            code: code
        });

        console.log("lobby created: ", code);
    });

    socket.on("join to room", (data, callback) => {
        let code = data.code;
        let token = data.token;

        if (token in players && code in lobbys)
        {
            socket.join(code);
            lobbys[code].members.add(token);

            callback({
                status: "OK",
                members: [...lobbys[code].members].map(x => players[x].nickname)
            });

            console.log(token, " joined to ", code);
            console.log(lobbys);
        } else {
            callback({
                status: "ERROR"
            });
        }
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