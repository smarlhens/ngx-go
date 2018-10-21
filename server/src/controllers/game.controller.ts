import {Game} from "../models/game";
import {PlayerController} from "./player.controller";
import uuidGenerator = require('uuid');

export class GameController {

    private games: Game[];

    constructor(private playerController: PlayerController) {
        this.games = [];
    }

    /**
     * @param nsp
     * @param socket
     */
    public new(nsp: any, socket: any): void {
        const uuid = uuidGenerator.v4();
        if (!this.getByUuid(uuid)) {
            this.games.push(new Game(uuid));
            socket.join('game');
            // send new game to all clients except sender
            nsp.to(socket.id).emit('new_uuid', uuid);
            socket.broadcast.to('game').emit('new_game', uuid);
        }
    }

    /**
     * @param nsp
     * @param socket
     */
    public getAll(nsp: any, socket: any): void {
        socket.join('game');
        nsp.to(socket.id).emit('get_all_games', this.games);
    }

    /**
     * @param uuid
     */
    public getByUuid(uuid: string): Game {
        return this.games.find((game) => game.uuid === uuid);
    }

    /**
     * @param uuid
     */
    public getIndexByUuid(uuid: string): number {
        return this.games.findIndex((game) => game.uuid === uuid);
    }

    /***
     * @param io
     */
    public deleteOldGames(io: any): void {
        console.log('gameController:deleteOldGames');
        if (typeof this.games !== "undefined" && null !== this.games && this.games.length > 0) {
            this.games.forEach((game, gameIndex) => {
                if (typeof game !== "undefined" && null !== game && (game.players.length === 0 || Math.round(((new Date()).getTime() - game.createdAt.getTime()) / 60000) >= 10)) {
                    io.of('/').emit('delete_game', game.uuid);
                    this.games.splice(gameIndex, 1);
                }
            });
        }
    }

    /**
     * @param io
     * @param nsp
     * @param socket
     * @param gameUuid
     * @param playerUuid
     */
    public join(io: any, nsp: any, socket: any, gameUuid: string, playerUuid: string): void {
        console.log('gameController:join_game');
        const game = this.getByUuid(gameUuid);
        let player = this.playerController.getByUuid(playerUuid);
        if (typeof game !== "undefined" && null !== game && typeof player !== "undefined" && null !== player && game.players.length < 2 && !game.active) {
            socket.join('game');
            player.socket = socket.id;
            game.players.push({self: player, ready: false});

            // get the opponent if exist
            const opponent = game.players.find((player) => player.self.uuid !== playerUuid);
            if (typeof opponent !== "undefined") {
                nsp.to(player.socket).emit('join_game', opponent.self);
                nsp.to(opponent.self.socket).emit('join_game', player);
                console.log('gameController:game_ready');
                io.to('game').emit('game_ready', gameUuid);
            }
        }
    }

    /**
     * @param io
     * @param nsp
     * @param socket
     * @param gameUuid
     * @param playerUuid
     */
    public leave(io: any, nsp: any, socket: any, gameUuid: string, playerUuid: string) {
        console.log('gameController:leave_game');
        const gameIndex = this.getIndexByUuid(gameUuid);
        const game = this.games[gameIndex];
        if (-1 !== gameIndex && typeof game !== "undefined" && null !== game && !game.active) {
            const playerIndex = game.players.findIndex((player) => player.self.uuid === playerUuid);
            if (-1 !== playerIndex) {
                socket.join('game');
                game.players.splice(playerIndex, 1);

                // get the opponent if exist
                const opponent = game.players.find((player) => player.self.uuid !== playerUuid);
                if (typeof opponent !== "undefined") {
                    opponent.ready = false;
                    nsp.to(opponent.self.socket).emit('leave_game', playerUuid);
                    console.log('gameController:game_pending');
                    io.to('game').emit('game_pending', gameUuid);
                }

                if (game.players.length === 0) {
                    this.deleteById(io, nsp, gameUuid);
                }
            }
        }
    }

    /**
     * @param io
     * @param nsp
     * @param uuid
     */
    public deleteById(io: any, nsp: any, uuid: string) {
        console.log('gameController:delete_game');
        io.to('game').emit('delete_game', uuid);
        this.games.splice(this.getIndexByUuid(uuid), 1);
    }
}