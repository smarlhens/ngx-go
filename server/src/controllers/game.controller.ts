import {Game} from "../models/game";
import {PlayerController} from "./player.controller";
import {GoService} from "../services/go.service";
import {Player} from "../models/player";
import uuidGenerator = require('uuid');

export class GameController {

    private games: Game[];

    constructor(private playerController: PlayerController, private goService: GoService) {
        this.games = [];
    }

    private static isTurnSkipped(game: Game, index: number) {
        return game.history[index].add.length === 0 && game.history[index].remove.length === 0;
    }

    /**
     * @param nsp
     * @param socket
     */
    public new(nsp: any, socket: any): void {
        const uuid = uuidGenerator.v4();
        if (!this.getByUuid(uuid)) {
            this.games.push(this.goService.createGame(uuid));
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
     * @param gameUuid
     */
    public gameExist(gameUuid: string): boolean {
        const gameIndex = this.getIndexByUuid(gameUuid);
        const game = this.games[gameIndex];
        return -1 !== gameIndex && typeof game !== "undefined" && null !== game;
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
        if (this.gameExist(gameUuid) && typeof player !== "undefined" && null !== player && ((game.players.length < 2 && !game.active) || (game.active && game.players.find((player) => player.self.uuid === playerUuid)))) {
            socket.join('game');
            player.socket = socket.id;

            if (game.active && game.players.find((player) => player.self.uuid === playerUuid)) {
                nsp.to(player.socket).emit('game_resume', game);
            }

            if (game.players.length < 2 && !game.active) {
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
        if (this.gameExist(gameUuid) && !game.active) {
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

    /**
     * @param nsp
     * @param socket
     * @param gameUuid
     * @param playerUuid
     */
    public playerReady(nsp: any, socket: any, gameUuid: string, playerUuid: string) {
        if (this.gameExist(gameUuid)) {
            const game = this.getByUuid(gameUuid);
            const player = game.players.find((player) => player.self.uuid === playerUuid);
            if (typeof player !== "undefined") {
                socket.join('game');
                player.ready = true;
                console.log('player_ready');

                // get the opponent if exist
                const opponent = game.players.find((player) => player.self.uuid !== playerUuid);
                if (typeof opponent !== "undefined") {
                    if (opponent.ready) {
                        nsp.to(socket.id).emit('player_ready', opponent.self.uuid);
                    }
                    nsp.to(opponent.self.socket).emit('player_ready', playerUuid);
                }

                if (game.players.every((player) => player.ready === true)) {
                    this.startGame(nsp, game);
                }
            }
        }
    }

    public newMove(nsp: any, socket: any, gameUuid: string, x: number, y: number) {
        if (this.gameExist(gameUuid)) {
            const game = this.getByUuid(gameUuid);

            if (GoService.isPlayable(game, x, y, game.turn)) {
                socket.join('game');
                this.goService.move(game, x, y).subscribe(
                    (success) => {
                        if (success) {
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
            }
        }
    }

    public skipTurn(nsp: any, socket: any, gameUuid: string, playerUuid: string, steps: number) {
        if (this.gameExist(gameUuid)) {
            const game = this.getByUuid(gameUuid);

            const player = game.players.find((player) => player.self.uuid === playerUuid);
            if (typeof player !== "undefined") {
                socket.join('game');
                this.goService.skip(game, playerUuid).subscribe(
                    (success) => {
                        if (success) {
                            // get the opponent
                            const opponent = game.players.find((player) => player.self.socket !== socket.id);
                            if (typeof opponent !== "undefined") {
                                // send new move to the opponent
                                console.log('new_skip');
                                nsp.to(opponent.self.socket).emit('new_skip', gameUuid, playerUuid, steps);
                            }

                            // if both players skip their turn
                            if (game.history.length >= 2 && GameController.isTurnSkipped(game, game.history.length - 1)
                                && GameController.isTurnSkipped(game, game.history.length - 2)) {
                                this.endGame(nsp, game, player, opponent);
                            }
                        }
                    }
                );
            }
        }
    }

    /**
     * @param nsp
     * @param game
     * @param player
     * @param opponent
     */
    private endGame(nsp: any, game: Game, player: { self: Player, ready: boolean }, opponent: { self: Player, ready: boolean }) {
        console.log('end_game');
        game.finishedAt = new Date();
        game.active = false;
        // get score
        nsp.to(player.self.socket).emit('game_end', game.uuid, game.finishedAt);
        if (typeof opponent !== "undefined") {
            nsp.to(opponent.self.socket).emit('game_end', game.uuid, game.finishedAt);
        }
    }

    /**
     * @param nsp
     * @param game
     */
    private startGame(nsp: any, game: Game) {
        game.active = true;
        game.turn = 1;
        console.log('game_start');
        const startingPlayer = game.players[Math.round(Math.random())];
        game.black = startingPlayer.self.uuid;
        game.startedAt = new Date();
        const opponent = game.players.find((player) => player.self.uuid !== startingPlayer.self.uuid);
        if (typeof opponent !== "undefined") {
            game.white = opponent.self.uuid;
        }
        nsp.to('game').emit('game_start', startingPlayer.self.uuid, game.startedAt);
    }
}