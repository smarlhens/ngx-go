import {Injectable} from '@angular/core';
import {NamespaceService} from "./namespace.service";
import {Observable} from "rxjs";
import {Game} from "../models/game";

@Injectable({
    providedIn: 'root'
})
export class GameService {

    constructor(private nsService: NamespaceService) {
    }

    /**
     * @param game
     */
    public newGame(game: Game): void {
        this.nsService.socket.emit('new_game', game.id);
    }

    public onNewGame() {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_game', (id: string) => {
                observer.next(new Game(id));
            });
        });
    }

    public getAvailableGames() {
        this.nsService.socket.emit('get_available_games');
        return Observable.create((observer) => {
            this.nsService.socket.on('get_available_games', (games: Game[]) => {
                observer.next(games);
            });
        });
    }

    /**
     * @param game
     * @param name
     */
    public joinGame(game: Game, name: string): void {
        this.nsService.socket.emit('join_game', game.id, name);
    }

    public onPlayerJoin() {
        return Observable.create((observer) => {
            this.nsService.socket.on('join_game', (name: string) => {
                observer.next(name);
            });
        });
    }

    /**
     * @param game
     * @param name
     */
    public leaveGame(game: Game, name: string): void {
        this.nsService.socket.emit('leave_game', game.id, name);
    }

    public onPlayerLeave() {
        return Observable.create((observer) => {
            this.nsService.socket.on('leave_game', (name: string) => {
                observer.next(name);
            });
        });
    }

    /**
     * @param game
     * @param name
     */
    public playerReady(game: Game, name: string): void {
        this.nsService.socket.emit('player_ready', game.id, name);
    }

    public onPlayerReady() {
        return Observable.create((observer) => {
            this.nsService.socket.on('player_ready', (name: string) => {
                observer.next(name);
            });
        });
    }

    public getDeleteGame() {
        return Observable.create((observer) => {
            this.nsService.socket.on('delete_game', (game: Game) => {
                observer.next(game);
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
        this.nsService.socket.emit('new_move', game.id, x, y);
    }

    public onNewMove() {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_move', (game: Game, x, y) => {
                observer.next({x, y});
            });
        });
    }

}
