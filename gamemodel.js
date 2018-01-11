/*jshint esversion: 6 */

class Game {
    constructor(ID, pieces, name, gameSize, linhas, colunas) {
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
        this.players = [];
        this.playerTurn = 1;
        this.tempTurn = 0;
        this.winner = 0;
        this.firstPiece = null;
        this.secondPiece = null;
        this.availablePieces=[];
        this.knownPieces={};
        this.hiddenPieces=[];
        this.board = this.newBoard(pieces, this.linhas, this.colunas);
        this.created = this.formatDate(new Date());
        this.firstMax='';
        this.currMax=-1;
        this.lastPlay=null;
        this.hasBot=false;
        this.actions=[];
        this.startingPlayers=[];
    }

    formatDate(date){
        let fill = function(value){
            return value < 10 ? '0' + value : value;
        }
        return fill(date.getHours()) + ':' + fill(date.getMinutes()) + ':' + fill(date.getSeconds());
    }

    newBoard(pieces, linhas, colunas){
        let all=[];
        for(let i=0; i<pieces.length; i++){
            if(pieces[i].active){
                all[all.length]=pieces[i].path.split('.')[0];
            }
        }
        const total = linhas*colunas;
        let temp=[];
        let random;
        for(let i = 0; i < total; i+=2){
            random = Math.round(Math.random()*(all.length-1));
            temp[i]=all[random];
            temp[i+1]=all[random];
            all.splice(random, 1);
        }
        let board=[];
        for(let i = 0; i < total; i++){
            random = Math.round(Math.random()*(temp.length-1));
            board[i]={show: false, piece: temp[random]};
            temp.splice(random, 1);
            this.availablePieces.push(i);
            this.hiddenPieces.push(i);
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
        this.actions[this.actions.length]=index;
        if(this.lastPlay===null){
            this.lastPlay=new Date().getTime();
        }
        this.board[index].show=true;
        if(this.hasBot){
            if(this.knownPieces[index]===undefined){
                this.knownPieces[index]=this.board[index].piece;
            }
            for(let i=0; i<this.hiddenPieces.length; i++){
                if(this.hiddenPieces[i] === index){
                    this.hiddenPieces.splice(i, 1);
                    break;
                }
            }
        }
        if(this.firstPiece===null){
            this.firstPiece=index;
            return 0;
        }else{
            this.lastPlay=new Date().getTime();
            if(this.board[this.firstPiece].piece === this.board[index].piece){
                if(this.hasBot){
                    delete this.knownPieces[this.fistPiece];
                    delete this.knownPieces[index];
                    for(let i=0; i<this.availablePieces.length; i++){
                        if(this.availablePieces[i] == this.firstPiece){
                            this.availablePieces.splice(i, 1);
                            break;
                        }
                    }
                    for(let i=0; i<this.availablePieces.length; i++){
                        if(this.availablePieces[i] == index){
                            this.availablePieces.splice(i, 1);
                            break;
                        }
                    }
                }
                this.firstPiece=null;
                this.players[this.playerTurn-1].score++;
                if(this.players[this.playerTurn-1].score > this.currMax){
                    this.currMax=this.players[this.playerTurn-1].score;
                    this.firstMax=this.players[this.playerTurn-1].name;
                }
                if(this.noMorePieces()){
                    this.gameEnded=true;
                    this.winner=this.firstMax;
                }
                return 1;
            }
            this.secondPiece=index;
            this.tempTurn=this.playerTurn;
            this.playerTurn=0;
            return -1;
        }
    }

    hidePieces(){
        this.board[this.firstPiece].show=false;
        this.board[this.secondPiece].show=false;
        this.firstPiece=null;
        this.secondPiece=null;
        this.playerTurn=this.tempTurn;
        this.nextPlayer();
    }

    nextPlayer(){
        this.playerTurn++;
        if(this.playerTurn > this.players.length){
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

    kickPlayer(player){
        let kick = false;
        let key = -1;
        for(key in this.players){
            if(this.players[key].id === player.id && this.players[key].name === player.name
                && this.players[key].socket === player.socket){
                kick=true;
                break;
            }
        }
        if (kick) {
            this.actions[this.actions.length]=-1;
            this.actions[this.actions.length]=key;
            this.players.splice(key, 1);
            this.playerTurn--;
            if(this.players.length==1){
                this.gameEnded=true;
                this.winner=this.players[0].name;
            }
            this.nextPlayer();
            this.lastPlay=new Date().getTime();
        }
    }

    addBot(bot){
        this.hasBot=true;
        if(bot <= 0.33){
            this.players[this.players.length]={id: '', name: 'Bot Charlie', socket: -1, score: 0, bot: true, botType: bot};
        }else if(bot <= 0.67){
            this.players[this.players.length]={id: '', name: 'Bot Frank', socket: -1, score: 0, bot: true, botType: bot};
        }else{
            this.players[this.players.length]={id: '', name: 'Bot Dennis', socket: -1, score: 0, bot: true, botType: bot};
        }
        if(this.players.length == this.gameSize){
            this.gameStarted=true;
            for(let i=0; i<this.player.length; i++){
                this.startingPlayers[i]={ id: this.players[i].id, name: this.players[i].name, socket: this.players[i].socket, score: this.players[i].score, bot: this.players[i].bot, botType: this.players[i].botType };
            } 
        }
    }

    botPlay(){
        if(Math.random() <= this.players[this.playerTurn-1].botType && this.players[this.playerTurn-1].botType != 0){
            return this.smartBot();
        }else{
            return this.dumbBot();
        }
    }

    dumbBot(){
        let random = Math.round(Math.random()*(this.availablePieces.length-1));
        this.revealPiece(this.availablePieces[random]);
        let secondRandom = random;
        while(random === secondRandom){
            secondRandom = Math.round(Math.random()*(this.availablePieces.length-1));
        }
        if(this.revealPiece(this.availablePieces[secondRandom]) === 1){
            return !this.gameEnded;
        }
        return false;
    }

    smartBot(){
        let piece = this.knowsPair();
        if(piece !== null){
            let firstPiece;
            let secondPiece;
            for(let key in this.knownPieces){
                if(this.knownPieces[key] == piece){
                    firstPiece=key;
                    break;
                }
            }
            for(let key in this.knownPieces){
                if(this.knownPieces[key] == piece && firstPiece !== key){
                    secondPiece=key;
                    break;
                }
            }
            this.revealPiece(firstPiece);
            this.revealPiece(secondPiece);
            return !this.gameEnded;
        }
        let random = this.hiddenPieces[Math.round(Math.random()*(this.hiddenPieces.length-1))];
        let newPiece = this.board[random].piece;
        this.revealPiece(random);
        if(this.knowsPair() !== null){
            for(let key in this.knownPieces){
                if(this.knownPieces[key] == newPiece && key != random){
                    piece=key;
                    break;
                }
            }
            this.revealPiece(piece);
            return !this.gameEnded;
        }
        random = this.hiddenPieces[Math.round(Math.random()*(this.hiddenPieces.length-1))]
        if(this.revealPiece(random) === 1){
            return !this.gameEnded;
        }
        return false;
    }

    knowsPair(){
        let known={};
        for(let key in this.knownPieces){
            if(known[this.knownPieces[key]] === undefined){
                known[this.knownPieces[key]]=0;
            }
            known[this.knownPieces[key]]++;
        }
        for(let piece in known){
            if(known[piece] === 2){
                return piece;
            }
        }
        return null;
    }

}

module.exports = Game;
