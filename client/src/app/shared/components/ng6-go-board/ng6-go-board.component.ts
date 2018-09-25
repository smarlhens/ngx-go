import {Component, OnInit} from '@angular/core';
import {GoService} from "../../services/go.service";
import {Game} from "../../models/game";
import {UserService} from "../../services/user.service";
import {GameService} from "../../services/game.service";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
    selector: 'ng6-go-board',
    templateUrl: './ng6-go-board.component.html'
})
export class Ng6GoBoardComponent implements OnInit {

    public game: Game;
    public username: string;

    constructor(private goService: GoService, private userService: UserService, private gameService: GameService) {
    }

    ngOnInit(): void {
        this.goService.game.subscribe((game) => this.game = game);
        this.userService.username
            .pipe(
                distinctUntilChanged()
            )
            .subscribe((username) => this.username = username)
        ;
        this.gameService.onPlayerJoin()
            .subscribe((name: string) => {
                this.goService.joinGame(this.game, name);
            })
        ;
        this.gameService.onPlayerLeave()
            .subscribe((name: string) => {
                this.goService.leaveGame(this.game, name);
            })
        ;
        this.gameService.onPlayerReady()
            .subscribe((name: string) => {
                this.goService.playerReady(this.game, name);
            })
        ;
        this.gameService.onGameStart()
            .subscribe((name: string) => {
                this.goService.gameStart(this.game, name);
            })
        ;
        this.gameService.onNewMove()
            .subscribe((pos: { x: number, y: number }) => {
                this.goService.move(this.game, pos.x, pos.y);
            })
        ;
    }

    /**
     * When the game is ready, add a stone to DOM if playable.
     * @param x: x coordinate
     * @param y: y coordinate
     */
    public onClick(x: number, y: number): void {
        console.log('x:' + x + ', y:' + y);
        this.goService.move(this.game, x, y);
    }

    /**
     * @param num
     */
    public num2letter(num: number): string {
        return this.goService.num2letter(num);
    }

    public playerReady(): void {
        this.goService.playerReady(this.game, this.username);
    }

    public amIReady(): boolean {
        return this.game.players.find((player) => player.name === this.username).ready
    }

    public isOpponentReady(): boolean {
        return this.game.players.every((player) => player.ready === true);
    }

}
