const Player = require('./player');

class Game {
    constructor(gameId) {
        this.turn = 0;
        this.isGameOver = 0;
        this.windMagnitude = (Math.random() * 25) + 5;
        this.windDirection = Math.random() < 0.5 ? -1 : 1;
        this.id = gameId;
        this.players = [];
    }

    addPlayer(playerId, socket) {
        this.players.push(new Player(playerId, this.id, socket));
        return this.players[this.players.length - 1]
    }

    getState() {
        const state = {
            'gameId': this.id,
            'isGameOver': this.isGameOver,
            'windMagnitude': this.windMagnitude,
            'windDirection': this.windDirection,
            'turn': this.turn
        };
        return state;
    }

    switchTurn() {
        this.turn = 1 - this.turn;
    }
}

module.exports = Game;