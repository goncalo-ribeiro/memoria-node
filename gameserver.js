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
var request=require('request');
var axios=require('axios');
var Game = require('./gamemodel.js');
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
	socket.on('chat_message', function (data){
		//socket.broadcast.emit('messageName', data);
		io.emit('chat_entry', data);	
    });
	
    socket.on('create_game', function (data){
    	console.log('A new game is about to be created');
        request.get('http://54.234.43.42/api/images',function(err,res,body){
            let game = games.createGame(JSON.parse(body), data.name, data.playerId, data.playerName, socket.id, data.size, data.token, data.linhas, data.colunas);
            socket.join(game.gameID);
            socket.emit('my_active_games_changed');
            io.emit('lobby_changed');
        });

    });

    socket.on('get_games_lobby', function(data){
        console.log('A lobby list request has been filed by ' + socket.id);
        socket.emit('lobby_games_changed', {lobbyGames: games.getLobbyGamesOf(socket.id)} );
    });

    socket.on('get_replay_lobby', function(){
        console.log('A replay list request has been filed');
        socket.emit('replay_lobby_games_changed', {lobbyGames: games.getReplayableLobbyGames()} );
    });

    socket.on('get_active_games', function(data){
        socket.emit('active_games_changed', {activeGames: games.getConnectedGamesOf(socket.id)} );
    });

    socket.on('join_game', function(data){
        let game = games.gameByID(data.gameId);
        console.log('A join request has been made on the game: ' + data.gameId + ' by: ' + data.playerName);
        if (game !== null && game.players.length < game.gameSize && !game.gameStarted) {
            games.joinGame(data.gameId, data.playerId, data.playerName, socket.id);
            socket.join(data.gameId);
            io.to(data.gameId).emit('my_active_games_changed');    
            io.emit('lobby_changed');
            console.log('join request granted!');
        }
    });

    socket.on('start', function(data){
        let game = games.gameByID(data.id);
        if(game.players[0].id == data.player){
            game.gameSize=game.players.length;
            game.gameStarted=true;
            io.to(data.id).emit('my_active_games_changed');   
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
            io.to(data.id).emit('my_active_games_changed');
            if(game.gameEnded){
                let players = [];
                for(let i=0; i<game.players.length; i++){
                    players[i]=game.players[i].id;
                }

                axios({
                    method: 'post',
                    url: 'http://54.234.43.42/api/games',
                    headers: {
                        'Accept' : 'application/json',
                        'Content-Type' : 'application/json',
                        'Authorization': 'Bearer ' + game.token,
                    },
                    data: {
                        total_players: game.gameSize,
                        created_by: game.createdBy,
                        winner: game.winnerId,
                        players: players
                    }
                }).then(response=>{
                    console.log(response);                    
                })
                .catch(error=>{
                    console.log(error);
                });
            }
        }else if(result === -1){//Match fail
            io.to(data.id).emit('my_active_games_changed');
            setTimeout(function(){ 
                game.hidePieces(); 
                io.to(data.id).emit('my_active_games_changed');
                if(game.players[(game.playerTurn-1)].bot){
                    let botresult;
                    do{
                        botResult=game.botPlay();
                        io.to(data.id).emit('my_active_games_changed');
                        if(botResult===false && !game.gameEnded){
                            setTimeout(function(){ 
                                game.hidePieces();
                                io.to(data.id).emit('my_active_games_changed');
                             }, 1000);
                        }
                        if(game.gameEnded){
                            let players = [];
                            for(let i=0; i<game.players.length; i++){
                                players[i]=game.players[i].id;
                            }
                            axios({
                                method: 'post',
                                url: 'http://54.234.43.42/api/games',
                                headers: {
                                    'Accept' : 'application/json',
                                    'Content-Type' : 'application/json',
                                    'Authorization': 'Bearer ' + game.token,
                                },
                                data: {
                                    total_players: game.gameSize,
                                    created_by: game.createdBy,
                                    winner: game.winnerId,
                                    players: players
                                }
                            }).then(response=>{
                                console.log(response);                    
                            })
                            .catch(error=>{
                                console.log(error);
                            });
                        }
                    }while(botResult);
                }
            }, 1000);
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

    socket.on('kick_player', function(data){
            if(data.player !== undefined){
            let game = games.gameByID(data.gameId);
            if(game != null){
                let kick = false;
                for(let key in game.players){
                    if(game.players[key].id === data.player.id && game.players[key].name === data.player.name
                        && game.players[key].socket === data.player.socket){
                        kick=true;
                        break;
                    }
                }
                if (kick) {
                    game.kickPlayer(data.player);
                    //SOCKET LEAVE data.player.socket
                    io.to(data.gameId).emit('my_active_games_changed');
                    if(game.gameEnded){
                        let players = [];
                        for(let i=0; i<game.players.length; i++){
                            players[i]=game.players[i].id;
                        }
                        axios({
                            method: 'post',
                            url: 'http://54.234.43.42/api/games',
                            headers: {
                                'Accept' : 'application/json',
                                'Content-Type' : 'application/json',
                                'Authorization': 'Bearer ' + game.token,
                            },
                            data: {
                                total_players: game.gameSize,
                                created_by: game.createdBy,
                                winner: game.winnerId,
                                players: players
                            }
                        }).then(response=>{
                            console.log(response);                    
                        })
                        .catch(error=>{
                            console.log(error);
                        });
                    }
                }
            }
        }
    });

    socket.on('close', function(data){
        let game = games.gameByID(data.id);
        if (game.gameEnded) {
            games.removeGame(data.id, socket.id);
            socket.leave(data.id);
            socket.emit('active_games_changed', { activeGames: games.getConnectedGamesOf(socket.id) } );
        }
    });

    socket.on('add_bot', function(data){
        let game = games.gameByID(data.id);
        if (game !== null && game.players.length < game.gameSize && !game.gameStarted) {
            game.addBot(data.bot);
            io.to(data.id).emit('my_active_games_changed');    
            io.emit('lobby_changed');
        }
    });

    socket.on('watch_game', function(data){
        let game = games.replayGameByID(data.gameId);
        socket.emit('new_active_replay', { game: game } );
    });
});
