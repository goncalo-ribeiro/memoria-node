/*jshint esversion: 6 */

class ReplayGameLobby {
    constructor(game) {
        this.gameID = game.gameID;
        this.name = game.name;
        this.gameSize = game.gameSize;
        this.player = game.players[0].name;
        this.winner = game.winner;
        this.created = game.created;
    }

}

module.exports = ReplayGameLobby;
