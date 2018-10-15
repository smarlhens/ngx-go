import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {Message} from "./models/message";
import {Game} from "./models/game";

export class App {
    public static readonly PORT: number = 1337;
    private app: express.Application;
    private server: Server;
    private url = require('url');
    private events = require('events');
    private io: SocketIO.Server;
    private port: string | number;
    private games: Game[];
    private messages: any;
    private routes = {
        'game': '^\\/game\\/[a-z0-9\\-]+$',
        'default': '^\\/$'
    };

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        // each 10 minutes, delete old this.games || empty this.games
        setInterval(this.deleteOldGames, 600000);
    }

    public getApp(): express.Application {
        return this.app;
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = App.PORT;
        this.events.EventEmitter.prototype.defaultMaxListeners = 0;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
        this.io.origins('*:*');
    }

    private listen(): void {
        this.messages = [];
        this.games = [];

        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.sockets.on('connection', (socket: any) => {
            const ns = this.url.parse(socket.handshake.url, true).query.ns;

            if (ns.match(new RegExp(this.routes['default']))) {
                let nsp = this.io.of(ns);

                if (typeof this.messages['default'] === 'undefined') {
                    this.messages['default'] = [];
                }

                nsp.on('connection', (socket: any) => {

                    socket.on('new_message', (message: Message) => {

                        // get last message
                        const last = this.messages['default'][this.messages['default'].length - 1];

                        // check if new and last this.messages are distinct
                        if (undefined === last || (undefined !== last && !(last.content === message.content && last.date === message.date && last.sender === message.sender))) {
                            socket.join('chat');
                            this.messages['default'].push(message);
                            // send new message to all clients except sender
                            socket.broadcast.to('chat').emit('new_message', message);
                        }

                    });

                    socket.on('get_messages', () => {
                        nsp.to(socket.id).emit('get_messages', this.messages['default']);
                    });

                    socket.on('get_username', () => {
                        nsp.to(socket.id).emit('get_username', 'player_' + Math.random().toString(36).substr(2, 9));
                    });

                    socket.on('new_game', (id: string) => {
                        if (!this.games.find((game) => game.id === id)) {
                            this.games.push(new Game(id));
                            socket.join('game');
                            // send new game to all clients except sender
                            socket.broadcast.to('game').emit('new_game', id);
                        }
                    });

                    socket.on('get_available_games', () => {
                        socket.join('game');
                        // send all this.games to the sender
                        nsp.to(socket.id).emit('get_available_games', this.games);
                    });

                });
            }

            if (ns.match(new RegExp(this.routes['game']))) {
                let nsp = this.io.of(ns);
                const gameId = ns.replace('\/game\/', '');

                if (typeof this.messages[gameId] === 'undefined') {
                    this.messages[gameId] = [];
                }

                nsp.on('connection', (socket: any) => {

                    socket.on('join_game', (id: string, name: string) => {
                        const game = this.games.find((game) => game.id === id);
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

                    socket.on('leave_game', (id: string, name: string) => {
                        const gameIndex = this.games.findIndex((game) => game.id === id);
                        const game = this.games[gameIndex];
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
                                    this.games.splice(gameIndex, 1);
                                }
                            }
                        }
                    });

                    socket.on('player_ready', (id: string, name: string) => {
                        const gameIndex = this.games.findIndex((game) => game.id === id);
                        const game = this.games[gameIndex];
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
                        // send all this.messages to the sender
                        nsp.to(socket.id).emit('get_messages', this.messages[gameId]);
                    });

                    socket.on('new_message', (message: Message, id: string) => {
                        if (null !== id) {
                            const gameIndex = this.games.findIndex((game) => game.id === id);
                            const game = this.games[gameIndex];

                            if (typeof game !== "undefined" && null !== game) {
                                // get last message
                                const last = this.messages[gameId][this.messages[gameId].length - 1];

                                // check if new and last this.messages are distinct
                                if (undefined === last || (undefined !== last && !(last.content === message.content && last.date === message.date && last.sender === message.sender))) {
                                    socket.join('chat');
                                    this.messages[gameId].push(message);

                                    // get the opponent if exist
                                    const opponent = game.players.find((player) => player.socket !== socket.id);
                                    console.log(opponent);
                                    if (typeof opponent !== "undefined") {
                                        // send new message to the opponent
                                        nsp.to(opponent.socket).emit('new_message', message);
                                    }
                                }
                            }
                        }
                    });

                    socket.on('new_move', (id: string, x: number, y: number) => {
                            const gameIndex = this.games.findIndex((game) => game.id === id);
                            const game = this.games[gameIndex];
                            if (-1 !== gameIndex && typeof game !== "undefined" && null !== game) {
                                socket.join('game');

                                // check if playable and store

                                // get the opponent
                                const opponent = game.players.find((player) => player.socket !== socket.id);
                                if (typeof opponent !== "undefined") {
                                    // send new move to the opponent
                                    console.log('new_move');
                                    nsp.to(opponent.socket).emit('new_move', id, x, y);
                                }

                            }
                        }
                    );
                });
            }
        });
    }

    private deleteOldGames(): void {
        if (typeof this.games !== "undefined" && null !== this.games && this.games.length > 0) {
            this.games.forEach((game, gameIndex) => {
                if (typeof game !== "undefined" && null !== game && (game.players.length === 0 || Math.round(((new Date()).getTime() - game.createdAt.getTime()) / 60000) >= 10)) {
                    this.io.of('/').emit('delete_game', game.id);
                    this.games.splice(gameIndex, 1);
                }
            });
        }
    }

}
