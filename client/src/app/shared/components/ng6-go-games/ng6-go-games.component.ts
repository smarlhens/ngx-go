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
            .subscribe((game: Game) => {
                if (!this.games.find((_game) => _game.id === game.id)) {
                    this.games.push(game);
                }
            })
        ;
        this.gameService.onDeleteGame()
            .subscribe((id: string) => {
                let index = this.games.findIndex((_game) => _game.id === id);
                if (-1 !== index) {
                    this.games.splice(index, 1);
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
