import {Component, OnInit} from '@angular/core';
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

    constructor(private gameService: GameService, private goService: GoService, private router: Router) {
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
            .subscribe((game: Game) => {
                if (!this.games.find((_game) => _game.id === game.id)) {
                    this.games.push(game);
                }
            })
        ;
        this.gameService.getDeleteGame()
            .subscribe((game: Game) => {
                let id = this.games.findIndex((_game) => _game.id === game.id);
                if (-1 !== id) {
                    this.games.splice(id, 1);
                }
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

}
