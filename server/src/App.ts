import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {Message} from "./models/message";
import {MessageController} from "./controllers/MessageController";
import {GameController} from "./controllers/GameController";

export class App {
    public static readonly PORT: number = 1337;
    private app: express.Application;
    private server: Server;
    private url = require('url');
    private events = require('events');
    private io: SocketIO.Server;
    private port: string | number;
    private gameController: GameController;
    private messageController: MessageController;
    private routes = {
        'game': '^\\/game\\/[a-z0-9\\-]+$',
        'default': '^\\/$'
    };

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.gameController = new GameController();
        this.messageController = new MessageController(this.gameController);
        // each 10 minutes, delete old this.games || empty this.games
        setInterval(() => {
            this.gameController.deleteOldGames(this.io);
        }, 600000);
        this.listen();
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
        this.events.EventEmitter.prototype.setMaxListeners(0);
    }

    private sockets(): void {
        this.io = socketIo(this.server);
        this.io.origins('*:*');
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.sockets.on('connection', (socket: any) => {
            const ns = this.url.parse(socket.handshake.url, true).query.ns;

            console.log(ns);

            if (ns.match(new RegExp(this.routes['default']))) {
                let nsp = this.io.of(ns);

                nsp.on('connection', (socket: any) => {

                    socket.on('new_message', (message: Message) => {
                        this.messageController.new(nsp, socket, message);
                    });

                    socket.on('get_messages', () => {
                        this.messageController.getAll(nsp, socket);
                    });

                    socket.on('get_username', () => {
                        nsp.to(socket.id).emit('get_username', 'player_' + Math.random().toString(36).substr(2, 9));
                    });

                    socket.on('new_game', (id: string) => {
                        this.gameController.new(socket, id);
                    });

                    socket.on('get_available_games', () => {
                        this.gameController.getPendingGames(nsp, socket);
                    });

                });
            }

            if (ns.match(new RegExp(this.routes['game']))) {
                let nsp = this.io.of(ns);
                const gameId = ns.replace('\/game\/', '');

                nsp.on('connection', (socket: any) => {

                    socket.on('join_game', (id: string, name: string) => {
                        this.gameController.join(this.io, nsp, socket, id, name);
                    });

                    socket.on('leave_game', (id: string, name: string) => {
                        this.gameController.leave(this.io, nsp, socket, id, name);
                    });

                    socket.on('player_ready', (id: string, name: string) => {
                        const gameIndex = this.gameController.getIndexById(id);
                        const game = this.gameController.getById(id);
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
                        this.messageController.getAll(nsp, socket, gameId);
                    });

                    socket.on('new_message', (message: Message, id: string) => {
                        this.messageController.new(nsp, socket, message, id);
                    });

                    socket.on('new_move', (id: string, x: number, y: number) => {
                            const gameIndex = this.gameController.getIndexById(id);
                            const game = this.gameController.getById(id);
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
}
