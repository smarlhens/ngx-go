import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {Message} from "./models/message";
import {MessageController} from "./controllers/message.controller";
import {GameController} from "./controllers/game.controller";
import {PlayerController} from "./controllers/player.controller";
import {Player} from "./models/player";

export class App {
    public static readonly PORT: number = 1337;
    private app: express.Application;
    private server: Server;
    private url = require('url');
    private events = require('events');
    private io: SocketIO.Server;
    private port: string | number;
    private playerController: PlayerController;
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
        this.playerController = new PlayerController();
        this.gameController = new GameController(this.playerController);
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

        let defaultNS = this.io.of('/');
        defaultNS.on('connection', (socket: any) => {

            socket.on('check_player', (player: Player) => {
                this.playerController.check(defaultNS, socket, player);
            });

            socket.on('new_message', (message: Message) => {
                this.messageController.new(defaultNS, socket, message);
            });

            socket.on('get_messages', () => {
                this.messageController.getAll(defaultNS, socket);
            });

            socket.on('new_player', () => {
                this.playerController.new(defaultNS, socket);
            });

            socket.on('new_game', () => {
                this.gameController.new(defaultNS, socket);
            });

            socket.on('get_all_games', () => {
                this.gameController.getAll(defaultNS, socket);
            });

            socket.on('disconnect', (reason) => {
                socket.removeAllListeners();
            });

        });

        this.io.sockets.on('connection', (socket: any) => {
            const ns = this.url.parse(socket.handshake.url, true).query.ns;

            if (ns.match(new RegExp(this.routes['game']))) {
                let nsp = this.io.of(ns);
                const gameId = ns.replace('\/game\/', '');

                nsp.on('connection', (socket: any) => {

                    socket.on('join_game', (gameUuid: string, playerUuid: string) => {
                        console.log('on join_game');
                        this.gameController.join(this.io, nsp, socket, gameUuid, playerUuid);
                    });

                    socket.on('leave_game', (gameUuid: string, playerUuid: string) => {
                        console.log('on_leave_game');
                        this.gameController.leave(this.io, nsp, socket, gameUuid, playerUuid);
                    });

                    socket.on('player_ready', (gameUuid: string, playerUuid: string) => {
                        const gameIndex = this.gameController.getIndexByUuid(gameUuid);
                        const game = this.gameController.getByUuid(gameUuid);
                        if (-1 !== gameIndex && typeof game !== "undefined" && null !== game) {
                            const player = game.players.find((player) => player.self.uuid === playerUuid);
                            if (typeof player !== "undefined") {
                                socket.join('game');
                                player.ready = true;
                                console.log('player_ready');

                                // get the opponent if exist
                                const opponent = game.players.find((player) => player.self.uuid !== playerUuid);
                                if (typeof opponent !== "undefined") {
                                    if(opponent.ready){
                                        nsp.to(socket.id).emit('player_ready', opponent.self.uuid);
                                    }
                                    nsp.to(opponent.self.socket).emit('player_ready', playerUuid);
                                }

                                const playersReady = game.players.every((player) => player.ready === true);
                                if (playersReady) {
                                    game.active = true;
                                    console.log('game_start');
                                    const startingPlayer = game.players[Math.round(Math.random())];
                                    game.black = startingPlayer.self.uuid;
                                    const opponent = game.players.find((player) => player.self.uuid !== startingPlayer.self.uuid);
                                    if (typeof opponent !== "undefined") {
                                        game.white = opponent.self.uuid;
                                    }
                                    nsp.to('game').emit('game_start', startingPlayer.self.uuid);
                                }
                            }
                        }
                    });

                    socket.on('get_messages', () => {
                        this.messageController.getAll(nsp, socket, gameId);
                    });

                    socket.on('new_message', (message: Message, gameUuid: string) => {
                        this.messageController.new(nsp, socket, message, gameUuid);
                    });

                    socket.on('new_move', (gameUuid: string, x: number, y: number) => {
                            const gameIndex = this.gameController.getIndexByUuid(gameUuid);
                            const game = this.gameController.getByUuid(gameUuid);
                            if (-1 !== gameIndex && typeof game !== "undefined" && null !== game) {
                                socket.join('game');

                                // check if playable and store

                                // get the opponent
                                const opponent = game.players.find((player) => player.self.socket !== socket.id);
                                if (typeof opponent !== "undefined") {
                                    // send new move to the opponent
                                    console.log('new_move');
                                    nsp.to(opponent.self.socket).emit('new_move', gameUuid, x, y);
                                }
                            }
                        }
                    );

                });
            }

            socket.on('disconnect', (reason) => {
                socket.removeAllListeners();
            });

        });
    }
}
