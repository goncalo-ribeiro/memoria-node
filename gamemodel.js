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
        this.totalHidden = 0;
        this.created = this.formatDate(new Date());
    }

    formatDate(date){
        let fill = function(value){
            return value < 10 ? '0' + value : value;
        }
        return fill(date.getDay()) + '/' + fill((date.getMonth()+1)) + '/' + date.getFullYear() + ' ' + fill(date.getHours()) + ':' + fill(date.getMinutes()) + ':' + fill(date.getUTCSeconds());
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
            this.nextPlayer();
            return -1;
        }
    }

    hidePieces(){
        this.totalHidden++
        if(this.totalHidden == this.gameSize){
            this.board[this.firstPiece].show=false;
            this.board[this.secondPiece].show=false;
            this.firstPiece=null;
            this.secondPiece=null;
            this.willHide=false;
            this.totalHidden=0;
        }
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
                players.push(this.players[i].name);
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
