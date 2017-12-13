/*jshint esversion: 6 */

var app = require('http').createServer();

// CORS TRIALS
// var app = require('http').createServer(function(req,res){
// 	// Set CORS headers
// 	res.setHeader('Access-Control-Allow-Origin', 'http://dad.p6.dev');
// 	res.setHeader('Access-Control-Request-Method', '*');
// 	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
// 	res.setHeader('Access-Control-Allow-Credentials', true);
// 	res.setHeader('Access-Control-Allow-Headers', req.header.origin);
// 	if ( req.method === 'OPTIONS' ) {
// 		res.writeHead(200);
// 		res.end();
// 		return;
// 	}
// });

var io = require('socket.io')(app);

var TicTacToeGame = require('./gamemodel.js');
var GameList = require('./gamelist.js');

app.listen(8080, function(){
	console.log('listening on *:8080');
});

// ------------------------
// Estrutura dados - server
// ------------------------

let games = new GameList();

io.on('connection', function (socket) {
    console.log('client has connected');

    socket.on('create_game', function (data){
    	console.log('A new game is about to be created');
    	let game = games.createGame(data.playerName, socket.id);
    	// Use socket channels/rooms
		socket.join(game.gameID);
		// Notification to the client that created the game
		socket.emit('active_games_changed');
		// Notification to all clients
		io.emit('lobby_changed');
    });

    socket.on('request_lobby_games_list', function(data){
        console.log('A lobby list request has been filed by ' + data.playerName);
        socket.emit('refresh_lobby_games_list', {lobbyGames: games.getLobbyGamesOf(socket.id)} );
    });

    socket.on('request_active_games_list', function(data){
        socket.emit('refresh_active_games_list', {activeGames: games.getConnectedGamesOf(socket.id)} );
    });

    socket.on('request_join_game', function(data){
        let game = games.gameByID(data.gameID);
        console.log('A join request has been made on the game: ' + data.gameID + ' by: ' + data.playerName);
        if (game.player2SocketID == 0) {
            games.joinGame(data.gameID, data.playerName, socket.id);
            socket.join(data.gameID);
            io.to(data.gameID).emit('active_games_changed');    
            io.emit('lobby_changed');
            console.log('join request granted!');
        }
    });

    socket.on('play', function(data){
        let game = games.gameByID(data.gameID);
        let playerNumber = (socket.id == game.player1SocketID ? 1 : 2);
        if (game.play(playerNumber, data.index)){
            io.to(data.gameID).emit('active_games_changed');
        }else{
            if (game.gameStarted == false) {
                socket.emit('alert', {message : "The game hasn't started jabroni!\nYou have to wait until another player joins"});
            }else{
                if (game.gameEnded == false) {
                    socket.emit('alert', {message : "It's not your turn jabroni!\nYou have to wait until the other player makes his play"});
                }
            }
        }
    });

    socket.on('close', function(data){
        let game = games.gameByID(data.gameID);
        if (game.gameEnded) {
            games.removeGame(data.gameID, socket.id);
            console.log('socket ' + socket.id + ' removed from game!');
            socket.leave(data.gameID);
            console.log('socket ' + socket.id + ' left room!');
            socket.emit('refresh_active_games_list', {activeGames: games.getConnectedGamesOf(socket.id)} );
        }
    });



    // ....

});
