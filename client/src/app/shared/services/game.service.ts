import {Injectable} from '@angular/core';
import {NamespaceService} from "./namespace.service";
import {Observable} from "rxjs";
import {Game} from "../models/game";
import {Player} from "../models/player";

@Injectable({
    providedIn: 'root'
})
export class GameService {

    constructor(private nsService: NamespaceService) {
    }

    public newGame() {
        this.nsService.socket.emit('new_game');
        return Observable.create((observer) => {
            this.nsService.socket.on('new_uuid', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public onNewGame() {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_game', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public getAll() {
        this.nsService.socket.emit('get_all_games');
        return Observable.create((observer) => {
            this.nsService.socket.on('get_all_games', (games: Game[]) => {
                observer.next(games);
            });
        });
    }

    /**
     * @param game
     * @param player
     */
    public joinGame(game: Game, player: Player): void {
        this.nsService.socket.emit('join_game', game.uuid, player.uuid);
    }

    public onPlayerJoin() {
        return Observable.create((observer) => {
            this.nsService.socket.on('join_game', (player: Player) => {
                observer.next(player);
            });
        });
    }

    /**
     * @param game
     * @param playerUuid
     */
    public leaveGame(game: Game, playerUuid: string): void {
        this.nsService.socket.emit('leave_game', game.uuid, playerUuid);
    }

    public onPlayerLeave() {
        return Observable.create((observer) => {
            this.nsService.socket.on('leave_game', (playerUuid: string) => {
                observer.next(playerUuid);
            });
        });
    }

    /**
     * @param game
     * @param playerUuid
     */
    public playerReady(game: Game, playerUuid: string): void {
        this.nsService.socket.emit('player_ready', game.uuid, playerUuid);
    }

    public onPlayerReady() {
        return Observable.create((observer) => {
            this.nsService.socket.on('player_ready', (playerUuid: string) => {
                observer.next(playerUuid);
            });
        });
    }

    public onDeleteGame() {
        return Observable.create((observer) => {
            this.nsService.socket.on('delete_game', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public onGameStart() {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_start', (game: Game) => {
                observer.next(game);
            });
        });
    }

    /**
     * @param game
     * @param x
     * @param y
     */
    public move(game: Game, x: number, y: number): void {
        this.nsService.socket.emit('new_move', game.uuid, x, y);
    }

    public onNewMove() {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_move', (game: Game, x, y) => {
                observer.next({x, y});
            });
        });
    }

    public onGameReady() {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_ready', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public onGamePending() {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_pending', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }
}
