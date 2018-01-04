/*jshint esversion: 6 */

class Game {
    constructor(ID, name, gameSize, linhas, colunas) {
        this.gameID = ID;
        this.name = name;
        this.gameEnded = false;
        this.gameStarted = gameSize == 1 ? true : false;
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
        this.firstPiece = null;
        this.secondPiece = null;
        this.board = this.newBoard(this.linhas, this.colunas);
        this.willHide = false;
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
        if (this.board[index].show == true) {
            return false;
        }
        return this.revealPiece(index);
    }

    revealPiece(index){
        this.board[index].show=true;
        if(this.firstPiece===null){
            this.firstPiece=index;
            return 0;
        }else{
            if(this.board[this.firstPiece].piece === this.board[index].piece){
                this.firstPiece=null;
                this.players[this.playerTurn-1].score++;
                if(this.noMorePieces()){
                    this.gameEnded=true;
                    this.winner=this.highScore();
                }
                return 1;
            }
            this.secondPiece=index;
            return -1;
        }
    }

    hidePieces(){
        this.board[this.firstPiece].show=false;
        this.board[this.secondPiece].show=false;
        this.firstPiece=null;
        this.secondPiece=null;
        this.willHide=false;
        this.nextPlayer();
    }

    nextPlayer(){
        this.playerTurn++;
        if(this.playerTurn > this.gameSize){
            this.playerTurn=1;
        }
    }

    noMorePieces(){
        for(let i = 0; i < this.board.length; i++){
            if(!this.board[i].show){
                return false;
            }
        }
        return true;
    }

    highScore(){
        let max=0;
        let players=[];
        for(let i=0; i<this.players.length; i++){
            if(this.players[i].score > max){
                max=this.players[i].score;
            } 
        }
        for(let i=0; i<this.players.length; i++){
            if(this.players[i].score == max){
                players.push(this.players[i].id);
            }
        }
        if(players.length > 1){
            let string='Tie between '
            for(let i=0; i<players.length; i++){
                string+=players[i];
                if(i !== players.length-1){
                    string += ' and ';
                }else{
                    string += '!';
                }
            }
            return string;
        }
        return players[0];
    }


}

module.exports = Game;
