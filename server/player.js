class Player {
    constructor(playerId, gameId, socket) {
        this.id= playerId;
        this.gameId = gameId;
        this.socket = socket
    }
}

module.exports = Player;
