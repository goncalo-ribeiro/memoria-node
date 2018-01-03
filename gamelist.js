/*jshint esversion: 6 */

var Game = require('./gamemodel.js');

class GameList {
	constructor() {
        this.contadorID = 0;
        this.games = new Map();
    }

    gameByID(gameID) {
    	let game = this.games.get(gameID);
    	return game;
    }

    createGame(name, playerId, socketID, gameSize, linhas, colunas) {
    	this.contadorID = this.contadorID+1;
    	var game = new Game(this.contadorID, name, gameSize, linhas, colunas);
    	game.players[game.players.length] = {id: playerId, socket: socketID};
    	this.games.set(game.gameID, game);
    	return game;
    }

    joinGame(gameID, playerId, socketID) {
    	let game = this.gameByID(gameID);
    	if (game===null || game.players.length >= game.gameSize) {
    		return null;
    	}
    	game.players[game.players.length] = {id: playerId, socket: socketID};
        if(game.players.length == game.gameSize){
            game.gameStarted=true;
        }
    	return game;
    }

    removeGame(gameID, socketID) {
    	let game = this.gameByID(gameID);
    	if (game===null) {
    		return null;
    	}
    	if (game.player1SocketID == socketID) {
    		game.player1SocketID = "";
    	} else if (game.player2SocketID == socketID) {
    		game.player2SocketID = "";
    	} 
    	if ((game.player1SocketID === "") && (game.player2SocketID === "")) {
    		this.games.delete(gameID);
    	}
    	return game;
    }

    getConnectedGamesOf(socketID) {
    	let games = [];
    	for (var [key, value] of this.games) {
		    for(let i = 0; i < value.players.length ; i++){
                if(value.players[i].socket == socketID){
                    games.push(value);
                    break;
                }
            }
		}
		return games;
    }

    getLobbyGamesOf(socketID) {
    	let games = [];
    	for (var [key, value] of this.games) {
    		if ((!value.gameStarted) && (!value.gameEnded))  {
                for(let i = 0; i < value.players.length ; i++){
                    if(value.players[i].socket == socketID){
                        games.push(value);
                        break;
                    }
                }
    		}
		}
		return games;
    }
}

module.exports = GameList;
