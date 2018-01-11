/*jshint esversion: 6 */

var Game = require('./gamemodel.js');
var GameProxy = require('./gameproxy.js');
var GameLobby = require('./gamelobby.js');
var ReplayGame = require('./replaygame.js');
var ReplayGameLobby = require('./replaygamelobby.js');

class GameList {
	constructor() {
        this.contadorID = 0;
        this.games = new Map();
    }

    gameByID(gameID) {
    	let game = this.games.get(gameID);
    	return game;
    }

    createGame(pieces, name, playerId, playerName, socketID, gameSize, linhas, colunas) {
    	this.contadorID = this.contadorID+1;
    	var game = new Game(this.contadorID, pieces, name, gameSize, linhas, colunas);
    	game.players[game.players.length] = {id: playerId, name: playerName, socket: socketID, score: 0, bot: false, botType: null};
    	this.games.set(game.gameID, game);
    	return game;
    }

    joinGame(gameID, playerId, playerName, socketID) {
    	let game = this.gameByID(gameID);
    	game.players[game.players.length] = {id: playerId, name: playerName, socket: socketID, score: 0, bot: false, botType: null};
        if(game.players.length == game.gameSize){
            game.gameStarted=true;
            for(let i=0; i<game.players.length; i++){
                game.startingPlayers[i]={ id: game.players[i].id, name: game.players[i].name, socket: game.players[i].socket, score: game.players[i].score, bot: game.players[i].bot, botType: game.players[i].botType };
            }
        }
    	return game;
    }

    removeGame(gameID, socketID) {
    	let game = this.gameByID(gameID);
    	if (game===null) {
    		return null;
    	}
        for(let i=0; i<game.players.length; i++){
            if (game.players[i].socket == socketID) {
                game.players[i].socket = "";
            }
        }
        /*for(let i=0; i<game.players.length; i++){
            if (game.players[i].socket != "") {
                return game;
            }
        }
    	
    	this.games.delete(gameID);*/
    	return game;
    }

    getConnectedGamesOf(socketID) {
    	let games = [];
    	for (var [key, value] of this.games) {
		    for(let i = 0; i < value.players.length ; i++){
                if(value.players[i].socket == socketID){
                    games.push(new GameProxy(value));
                    break;
                }
            }
		}
		return games;
    }

    getLobbyGamesOf(socketID) {
    	let games = [];
        let toReturn = true;
    	for (var [key, value] of this.games) {
            toReturn = true;
    		if ((!value.gameStarted) && (!value.gameEnded))  {
                for(let i = 0; i < value.players.length ; i++){
                    if(value.players[i].socket === socketID){
                        toReturn=false;
                        break;
                    }
                }
                if(toReturn){
                    games.push(new GameLobby(value));
                }
    		}
		}
		return games;
    }

    getReplayableLobbyGames() {
        let games = [];
        for (var [key, value] of this.games) {
            if (value.gameEnded)  {
                games.push(new ReplayGameLobby(value));
            }
        }
        return games;
    }

    replayGameByID(id){
        for (var [key, value] of this.games) {
            if (value.gameEnded && value.gameID == id)  {
                return new ReplayGame(value);
            }
        }
        return null;
    }
}

module.exports = GameList;
