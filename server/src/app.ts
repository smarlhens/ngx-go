import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {Message} from "./models/message";
import {MessageController} from "./controllers/message.controller";
import {GameController} from "./controllers/game.controller";
import {PlayerController} from "./controllers/player.controller";
import {Player} from "./models/player";
import {GoService} from "./services/go.service";

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
    private goService: GoService;
    private routes = {
        'game': '^\\/game\\/[a-z0-9\\-]+$',
        'default': '^\\/$'
    };

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.goService = new GoService();
        this.playerController = new PlayerController();
        this.gameController = new GameController(this.playerController, this.goService);
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

            socket.on('new_name', (playerUuid: string, name: string) => {
                this.playerController.newName(defaultNS, socket, playerUuid, name);
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
                        console.log('on_player_ready');
                        this.gameController.playerReady(nsp, socket, gameUuid, playerUuid);
                    });

                    socket.on('get_messages', () => {
                        this.messageController.getAll(nsp, socket, gameId);
                    });

                    socket.on('new_message', (message: Message, gameUuid: string) => {
                        this.messageController.new(nsp, socket, message, gameUuid);
                    });

                    socket.on('new_move', (gameUuid: string, x: number, y: number) => {
                        this.gameController.newMove(nsp, socket, gameUuid, x, y);
                    });

                });
            }

            socket.on('disconnect', (reason) => {
                socket.removeAllListeners();
            });

        });
    }
}
