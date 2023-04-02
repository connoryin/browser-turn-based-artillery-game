const express = require('express');
const app = express();
const server = require('http').createServer(app);
const {Server} = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const path = require('path');
const Game = require("./Game");

// Serve the static files from the React app
app.use(express.static('../client/build'));

// Serve the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


const games = [];
io.on("connection", (socket) => {
    socket.on("fire", (data) => {
        console.log(data)
        const game = games[data["gameId"]];

        game.players[1 - data["myTurn"]].socket.emit('updateProjectile', {
            'ang': data['ang'],
            'velocity': data['velocity'],
            'turn': data["myTurn"]
        })

        game.switchTurn()
    });

    socket.on('joinGame', function (playerId) {
        console.log(`Player ${playerId} joined game`);
        let player = null;
        loop: for (let i = 0; i < games.length; i++) {
            const game = games[i];
            for (let p of game.players) {
                if (p.id === playerId) {
                    player = p;
                    player.socket = socket
                    break loop;
                }
            }
            if (game.players.length < 2) {
                player = game.addPlayer(playerId, socket);
                break;
            }
        }
        if (!player) {
            const game = new Game(games.length);
            games.push(game);
            player = game.addPlayer(playerId, socket);
        }
        console.log(`Player ${player.id} joined game ${player.gameId}`);

        const game = games[player.gameId];
        let state = game.getState()
        state['num'] = game.players.indexOf(player)
        socket.emit("gameState", state);
    });

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
    });

    socket.on("over", (state) => {
        const game = games[state["gameId"]];
        game.isGameOver = state["loser"];
    })
});


// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


