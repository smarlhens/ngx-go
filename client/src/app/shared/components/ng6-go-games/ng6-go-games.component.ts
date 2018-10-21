import {Component, OnInit} from '@angular/core';
import {GoService} from "../../services/go.service";
import {Router} from "@angular/router";
import {GameService} from "../../services/game.service";
import {Game} from "../../models/game";
import {Observable, of} from "rxjs";
import {distinctUntilChanged, filter, flatMap, take, tap} from "rxjs/operators";

@Component({
    selector: 'ng6-go-games',
    templateUrl: './ng6-go-games.component.html'
})
export class Ng6GoGamesComponent implements OnInit {

    public games: Game[];
    public gamesList: Observable<Game[]>;
    public loading: boolean;

    constructor(private gameService: GameService, private goService: GoService, private router: Router) {
        this.games = [];
    }

    ngOnInit(): void {
        this.loading = true;
        this.gamesList = of(this.games);
        this.gameService.getAll()
            .pipe(
                take(1),
                tap(() => this.loading = false),
                flatMap((games: Game[]) => games),
                filter((game: Game) => typeof game.uuid !== "undefined" && null !== game.uuid && game.uuid.length > 0),
                distinctUntilChanged((a: Game, b: Game) => a.uuid === b.uuid)
            )
            .subscribe((game: Game) => {
                this.games.push(game);
            })
        ;
        this.gameService.onNewGame()
            .subscribe((uuid: string) => {
                this.add(uuid);
            })
        ;
        this.gameService.onDeleteGame()
            .subscribe((uuid: string) => {
                this.delete(uuid);
            })
        ;
        this.gameService.onGameReady()
            .subscribe((uuid: string) => {
                this.delete(uuid);
            })
        ;
        this.gameService.onGamePending()
            .subscribe((uuid: string) => {
                this.add(uuid);
            })
        ;
    }

    public newGame(): void {
        this.gameService.newGame()
            .pipe(
                take(1)
            )
            .subscribe((uuid: string) => {
                this.router.navigate(['/game', uuid]);
            })
        ;
    }

    public joinGame(uuid: string): void {
        this.router.navigate(['/game', uuid]);
    }

    private delete(uuid: string) {
        let index = this.games.findIndex((_game) => _game.uuid === uuid);
        if (-1 !== index) {
            this.games.splice(index, 1);
        }
    }

    private add(uuid: string) {
        if (!this.games.find((game) => game.uuid === uuid)) {
            this.games.push(new Game(uuid));
        }
    }

}
