/*jshint esversion: 6 */

class GameLobby {
    constructor(game) {
        this.gameID = game.gameID;
        this.name = game.name;
        this.gameStarted = game.gameStarted;
        this.gameSize = game.players.length + '/' + game.gameSize;
        this.player = game.players[0].name;
        this.created = game.created;
    }

}

module.exports = GameLobby;
