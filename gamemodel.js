/*jshint esversion: 6 */

class Game {
    constructor(ID, gameSize, linhas, colunas) {
        this.gameID = ID;
        this.gameEnded = false;
        this.gameStarted = false;
        this.gameSize = gameSize;
        if(linhas !== undefined && colunas !== undefined && linhas <= 8 && colunas <= 10){
            this.linhas=linhas;
            this.colunas=colunas;
        }else{
            this.linhas=gameSize > 3 ? 6 : 4;
            this.colunas=gameSize > 2 ? 6 : 4;
        }
        this.players=[];
        this.playerTurn = 1;
        this.winner = 0;
        this.board = this.newBoard(this.linhas, this.colunas);
    }

    newBoard(linhas, colunas){
        const total = linhas*colunas;
        let temp=[];
        let board=[];
        for(let i = 0; i < total; i+=2){
            temp[i]=i/2;
            temp[i+1]=i/2;
        }
        let random;
        for(let i = 0; i < total; i++){
            random = Math.round(Math.random()*(temp.length-1));
            board[i]={show: false, piece: temp[random]};
            temp.splice(random, 1);
        }
        return board;
    }

    hasRow(value){
        return  ((this.board[0]==value) && (this.board[1]==value) && (this.board[2]==value)) || 
                ((this.board[3]==value) && (this.board[4]==value) && (this.board[5]==value)) || 
                ((this.board[6]==value) && (this.board[7]==value) && (this.board[8]==value)) || 
                ((this.board[0]==value) && (this.board[3]==value) && (this.board[6]==value)) || 
                ((this.board[1]==value) && (this.board[4]==value) && (this.board[7]==value)) || 
                ((this.board[2]==value) && (this.board[5]==value) && (this.board[8]==value)) || 
                ((this.board[0]==value) && (this.board[4]==value) && (this.board[8]==value)) || 
                ((this.board[2]==value) && (this.board[4]==value) && (this.board[6]==value));
    }  

    checkGameEnded(){
        if (this.hasRow(1)) {
            this.winner = 1;
            this.gameEnded = true;
            return true;
        } else if (this.hasRow(2)) {
            this.winner = 2;
            this.gameEnded = true;
            return true;
        } else if (this.isBoardComplete()) {
            this.winner = 0;
            this.gameEnded = true;
            return true;
        }
        return false;
    }

    isBoardComplete(){
        for (let value of this.board) {
            if (value === 0) {
                return false;
            }
        }
        return true;
    }

    play(playerNumber, index){
        if (!this.gameStarted) {
            return false;
        }
        if (this.gameEnded) {
            return false;
        }
        if (playerNumber != this.playerTurn) {
            return false;
        }
        if (this.board[index] !== 0) {
            return false;
        }
        this.board[index] = playerNumber;
        if (!this.checkGameEnded()) {
            this.playerTurn = this.playerTurn == 1 ? 2 : 1;
        }
        return true;
    }

}

module.exports = Game;
