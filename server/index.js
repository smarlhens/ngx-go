let express = require('express');
let app = express();
let http = require('http');
let server = http.Server(app);
let url = require('url');
let socketIO = require('socket.io');
let io = socketIO(server);
const port = process.env.PORT || 3000;

const Game = require('./dist/game.js').Game;

let games = [];
let messages = [];

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

process.setMaxListeners(Infinity);

const routes = {
    'game': '^\\/game\\/[a-z0-9\\-]+$',
    'default': '^\\/$'
};

io.sockets.on('connection', function (socket) {
    const ns = url.parse(socket.handshake.url, true).query.ns;

    if (ns.match(new RegExp(routes['default']))) {
        let nsp = io.of(ns);

        if (typeof messages['default'] === 'undefined') {
            messages['default'] = [];
        }

        nsp.on('connection', function (socket) {

            socket.on('new_message', (message) => {

                // get last message
                const last = messages['default'][messages['default'].length - 1];

                // check if new and last messages are distinct
                if (undefined === last || (undefined !== last && !(last.content === message.content && last.date === message.date && last.sender === message.sender))) {
                    socket.join('chat');
                    messages['default'].push(message);
                    // send new message to all clients except sender
                    socket.broadcast.to('chat').emit('new_message', message);
                }

            });

            socket.on('get_messages', () => {
                // send all messages to the sender
                nsp.to(socket.id).emit('get_messages', messages['default']);
            });

            socket.on('new_game', (id) => {
                if (!games.find((game) => game.id === id)) {
                    games.push(new Game(id));
                    socket.join('game');
                    // send new game to all clients except sender
                    socket.broadcast.to('game').emit('new_game', id);
                }
            });

            socket.on('get_available_games', () => {
                socket.join('game');
                // send all games to the sender
                nsp.to(socket.id).emit('get_available_games', games);
            });

        });
    }

    if (ns.match(new RegExp(routes['game']))) {
        let nsp = io.of(ns);
        const gameId = ns.replace('\/game\/', '');
        if (typeof messages[gameId] === 'undefined') {
            messages[gameId] = [];
        }

        nsp.on('connection', function (socket) {

            socket.on('join_game', (id, name) => {
                const game = games.find((game) => game.id === id);
                if (typeof game !== "undefined" && null !== game && !game.players.find((player) => player.name === name) && game.players.length < 2 && !game.active) {
                    game.players.push({'name': name, 'ready': false, 'socket': socket.id});
                    socket.join('game');
                    console.log('join_game');
                    // get the opponent if exist
                    const opponent = game.players.find((player) => player.name !== name);
                    if (typeof opponent !== "undefined") {
                        nsp.to(socket.id).emit('join_game', opponent.name);
                        nsp.to(opponent.socket).emit('join_game', name);
                    }
                }
            });

            socket.on('leave_game', (id, name) => {
                const gameIndex = games.findIndex((game) => game.id === id);
                const game = games[gameIndex];
                if (-1 !== gameIndex && typeof game !== "undefined" && null !== game && !game.active) {
                    const playerIndex = game.players.findIndex((player) => player.name === name);
                    if (-1 !== playerIndex) {
                        socket.join('game');
                        game.players.splice(playerIndex, 1);
                        console.log('leave_game');

                        // get the opponent if exist
                        const opponent = game.players.find((player) => player.name !== name);
                        if (typeof opponent !== "undefined") {
                            nsp.to(opponent.socket).emit('leave_game', name);
                        }

                        if (game.players.length === 0) {
                            console.log('delete_game');
                            nsp.to('game').emit('delete_game', id);
                            games.splice(gameIndex, 1);
                        }
                    }
                }
            });

            socket.on('player_ready', (id, name) => {
                const gameIndex = games.findIndex((game) => game.id === id);
                const game = games[gameIndex];
                if (-1 !== gameIndex && typeof game !== "undefined" && null !== game) {
                    const player = game.players.find((player) => player.name === name);
                    if (typeof player !== "undefined") {
                        socket.join('game');
                        player.ready = true;
                        console.log('player_ready');
                        // get the opponent if exist
                        const opponent = game.players.find((player) => player.name !== name);
                        if (typeof opponent !== "undefined") {
                            nsp.to(opponent.socket).emit('player_ready', name);
                        }

                        const playersReady = game.players.every((player) => player.ready === true);
                        if (playersReady) {
                            game.active = true;
                            console.log('game_start');
                            const startingPlayer = game.players[Math.round(Math.random())];
                            game.black = startingPlayer.name;
                            const opponent = game.players.find((player) => player.name !== startingPlayer.name);
                            if (typeof opponent !== "undefined") {
                                game.white = opponent.name;
                            }
                            nsp.to('game').emit('game_start', startingPlayer.name);
                        }
                    }
                }
            });

            socket.on('get_messages', () => {
                console.log('get_messages');
                // send all messages to the sender
                nsp.to(socket.id).emit('get_messages', messages[gameId]);
            });

            socket.on('new_message', (message) => {

                // get last message
                const last = messages[gameId][messages[gameId].length - 1];

                // check if new and last messages are distinct
                if (undefined === last || !(undefined !== last && last.content === message.content && last.date === message.date && last.sender === message.sender)) {
                    socket.join('chat');
                    console.log('new_message');
                    messages[gameId].push(message);

                    // get the opponent if exist
                    const opponent = game.players.find((player) => player.name !== name);
                    if (typeof opponent !== "undefined") {
                        // send new message to the opponent
                        nsp.to(opponent.socket).emit('new_message', message);
                    }
                }
            });

            socket.on('new_move', (id, x, y) => {
                    const gameIndex = games.findIndex((game) => game.id === id);
                    const game = games[gameIndex];
                    if (-1 !== gameIndex && typeof game !== "undefined" && null !== game) {
                        socket.join('game');
                        console.log('new_move');

                        // check if playable and store

                        // get the opponent
                        const opponent = game.players.find((player) => player.socket !== socket.id);
                        console.log(opponent);
                        if (typeof opponent !== "undefined") {
                            // send new move to the opponent
                            console.log('server:new_move, x:' + x + ', y:' + y);
                            nsp.to(opponent.socket).emit('new_move', id, x, y);
                        }

                    }
                }
            );
        });
    }
});
