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

var Game = require('./gamemodel.js');
var GameList = require('./gamelist.js');

app.listen(8080, function(){
	console.log('listening on *:8080');
});

// ------------------------
// Estrutura dados - server
// ------------------------

let games = new GameList();
//games.createGame(1,1,4,8,10);
//games.joinGame(1,2,2);

io.on('connection', function (socket) {
    console.log('client has connected');

    socket.on('create_game', function (data){
    	console.log('A new game is about to be created');
        console.log(data);
    	let game = games.createGame(data.name, data.playerId, data.playerName, socket.id, data.size, data.linhas, data.colunas);
        // Use socket channels/rooms
		socket.join(game.gameID);
		// Notification to the client that created the game
		socket.emit('my_active_games_changed');
		// Notification to all clients
		io.emit('lobby_changed');
    });

    socket.on('get_games_lobby', function(data){
        console.log('A lobby list request has been filed by ' + socket.id);
        socket.emit('lobby_games_changed', {lobbyGames: games.getLobbyGamesOf(socket.id)} );
    });

    socket.on('get_active_games', function(data){
        let activeGamez = games.getConnectedGamesOf(socket.id);
        socket.emit('active_games_changed', {activeGames: activeGamez} );
        for(let i=0; i<activeGamez.length; i++){
            if(activeGamez[i].willHide === true){
                activeGamez[i].hidePieces();
            }
        }
    });

    socket.on('join_game', function(data){
        let game = games.gameByID(data.gameId);
        console.log('A join request has been made on the game: ' + data.gameId + ' by: ' + data.playerName);
        if (game !== null && game.players.length < game.gameSize) {
            games.joinGame(data.gameId, data.playerId, data.playerName, socket.id);
            socket.join(data.gameId);
            io.to(data.gameId).emit('my_active_games_changed');    
            io.emit('lobby_changed');
            console.log('join request granted!');
        }
    });

    socket.on('play', function(data){
        let game = games.gameByID(data.id);
        let playerNumber;
        for(let i=0; i<game.players.length; i++){
            if(game.players[i].socket == socket.id){
                playerNumber=i+1;
                break;
            }
        }
        let result = game.play(playerNumber, data.index);
        if (result === 1 || result === 0){//Piece Match or first move
            io.emit('my_active_games_changed'); //Ta a enviar a todos os jogos, refazer o to!!!
        }else if(result === -1){//Match fail
            io.emit('my_active_games_changed'); //Ta a enviar a todos os jogos, refazer o to!!!
            game.willHide=true;
            game.nextPlayer();
        }else{
            if (game.gameStarted === false){
                socket.emit('alert', {message : "The game hasn't started jabroni!\nYou have to wait until another player joins"});
            }else{
                if (game.gameEnded === false) {
                    socket.emit('alert', {message : "It's not your turn jabroni!\nYou have to wait until the other player makes his play"});
                }
            }
        }
    });

    socket.on('close', function(data){
        let game = games.gameByID(data.id);
        if (game.gameEnded) {
            games.removeGame(data.id, socket.id);
            console.log('socket ' + socket.id + ' removed from game!');
            socket.leave(data.id);
            console.log('socket ' + socket.id + ' left room!');
            socket.emit('active_games_changed', {activeGames: games.getConnectedGamesOf(socket.id)} );
        }
    });



    // ....

});
