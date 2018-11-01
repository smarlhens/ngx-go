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

    public newGame(): Observable<string> {
        this.nsService.socket.emit('new_game');
        return Observable.create((observer) => {
            this.nsService.socket.on('new_uuid', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public onNewGame(): Observable<string> {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_game', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public getAll(): Observable<Game[]> {
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

    public onPlayerJoin(): Observable<Player> {
        return Observable.create((observer) => {
            this.nsService.socket.on('join_game', (player: Player) => {
                observer.next(player);
            });
        });
    }

    public onGameResume(): Observable<Game> {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_resume', (game: Game) => {
                observer.next(game);
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

    public onPlayerLeave(): Observable<string> {
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

    public onPlayerReady(): Observable<string> {
        return Observable.create((observer) => {
            this.nsService.socket.on('player_ready', (playerUuid: string) => {
                observer.next(playerUuid);
            });
        });
    }

    public onDeleteGame(): Observable<string> {
        return Observable.create((observer) => {
            this.nsService.socket.on('delete_game', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public onGameStart(): Observable<{ playerUuid: string, startedAt: Date }> {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_start', (playerUuid: string, startedAt: Date) => {
                observer.next({playerUuid, startedAt});
            });
        });
    }

    public onGameEnd(): Observable<{ gameUuid: string, finishedAt: Date }> {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_end', (gameUuid: string, finishedAt: Date) => {
                observer.next({gameUuid, finishedAt});
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

    public skip(game: Game, playerUuid: string): void {
        this.nsService.socket.emit('new_skip', game.uuid, playerUuid, game.steps);
    }

    public onSkip(): Observable<{ gameUuid: string, playerUuid: string, steps: number }> {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_skip', (gameUuid: string, playerUuid: string, steps: number) => {
                observer.next({gameUuid, playerUuid, steps});
            });
        });
    }

    public onNewMove(): Observable<{ x: number, y: number }> {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_move', (game: Game, x, y) => {
                observer.next({x, y});
            });
        });
    }

    public onGameReady(): Observable<string> {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_ready', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }

    public onGamePending(): Observable<string> {
        return Observable.create((observer) => {
            this.nsService.socket.on('game_pending', (uuid: string) => {
                observer.next(uuid);
            });
        });
    }
}
