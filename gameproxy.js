/*jshint esversion: 6 */

class GameProxy {
    constructor(game) {
        this.gameID = game.gameID;
        this.name = game.name;
        this.gameEnded = game.gameEnded;
        this.gameStarted = game.gameStarted;
        this.gameSize = game.gameSize;
        this.colunas= game.colunas;
        this.players = game.players;
        this.playerTurn = game.playerTurn;;
        this.winner = game.winner;
        this.board = [];
        for(let i =0; i<game.board.length; i++){
            this.board[i] = game.board[i].show ? game.board[i].piece : 'hidden';
        }
        this.created = game.created;
        this.lastPlay=game.lastPlay;
    }

}

module.exports = GameProxy;
