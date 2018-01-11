/*jshint esversion: 6 */

class ReplayGame {
    constructor(game) {
        this.gameID = game.gameID;
        this.name = game.name;
        this.gameEnded = false;
        this.gameStarted = false;
        this.gameSize = game.gameSize;
        this.colunas = game.colunas;
        this.players = game.startingPlayers;
        this.playerTurn = 1;
        this.winner = game.winner;
        this.firstPiece = null;
        this.secondPiece = null;
        this.board = this.newBoard(game.board);
        this.actions= game.actions;
        this.currAction = 0;
        this.hidden=game.hidden;
    }

    newBoard(board){
        for(let i=0; i<board.length; i++){
            board[i].show=false;
        }
        return board;
    }

}

module.exports = ReplayGame;
