import {Component, NgZone, OnInit} from '@angular/core';
import {GoService} from "../../services/go.service";
import {Router} from "@angular/router";
import {GameService} from "../../services/game.service";
import {Game} from "../../models/game";
import {Observable, of} from "rxjs";
import {take} from "rxjs/operators";

@Component({
    selector: 'ng6-go-games',
    templateUrl: './ng6-go-games.component.html'
})
export class Ng6GoGamesComponent implements OnInit {

    public games: Game[];
    public gamesList: Observable<Game[]>;

    constructor(private gameService: GameService, private goService: GoService, private router: Router, private zone: NgZone) {
    }

    ngOnInit(): void {
        this.gameService.getAvailableGames()
            .pipe(
                take(1)
            )
            .subscribe((games: Game[]) => {
                this.games = games;
                this.gamesList = of(this.games);
            })
        ;
        this.gameService.onNewGame()
            .subscribe((id: string) => {
                this.add(id);
            })
        ;
        this.gameService.onDeleteGame()
            .subscribe((id: string) => {
                this.delete(id);
            })
        ;
        this.gameService.onGameReady()
            .subscribe((id: string) => {
                this.delete(id);
            })
        ;
        this.gameService.onGamePending()
            .subscribe((id: string) => {
                this.add(id);
            })
        ;
    }

    public newGame(): void {
        const game = this.goService.createGame();
        this.router.navigate(['/game', game.id]);
    }

    public joinGame(id: string): void {
        this.router.navigate(['/game', id]);
    }

    private delete(id: string) {
        let index = this.games.findIndex((_game) => _game.id === id);
        if (-1 !== index) {
            this.games.splice(index, 1);
        }
    }

    private add(id: string) {
        if (!this.games.find((game) => game.id === id)) {
            this.games.push(new Game(id));
        }
    }

}
