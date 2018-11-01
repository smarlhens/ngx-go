import {Component, OnInit} from '@angular/core';
import {GoService} from "../../services/go.service";
import {Game} from "../../models/game";
import {PlayerService} from "../../services/player.service";
import {GameService} from "../../services/game.service";
import {distinctUntilChanged, filter} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {Player} from "../../models/player";
import {SnackService} from "../../services/snack.service";
import {MatDialog} from "@angular/material";
import {Ng6GoEndGameDialogComponent} from "../ng6-go-end-game-dialog/ng6-go-end-game-dialog.component";

@Component({
    selector: 'ng6-go-board',
    templateUrl: './ng6-go-board.component.html'
})
export class Ng6GoBoardComponent implements OnInit {

    public game: Game;
    public player: Player;

    constructor(
        private goService: GoService,
        private playerService: PlayerService,
        private gameService: GameService,
        public snackService: SnackService,
        private translate: TranslateService,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.goService.game$.subscribe((game) => this.game = game);
        this.playerService.player$
            .pipe(
                distinctUntilChanged()
            )
            .subscribe((player) => this.player = player)
        ;
        this.gameService.onPlayerJoin()
            .subscribe((player: Player) => {
                this.goService.joinGame(this.game, player);
            })
        ;
        this.gameService.onPlayerLeave()
            .subscribe((playerUuid: string) => {
                this.goService.leaveGame(this.game, playerUuid);
            })
        ;
        this.gameService.onPlayerReady()
            .subscribe((playerUuid: string) => {
                this.goService.playerReady(this.game, playerUuid);
            })
        ;
        this.gameService.onGameStart()
            .subscribe((data: { playerUuid: string, startedAt: Date }) => {
                this.goService.gameStart(this.game, data);
            })
        ;
        this.gameService.onGameEnd()
            .pipe(
                filter((data) => data.gameUuid === this.game.uuid),
            )
            .subscribe((data: { gameUuid: string, finishedAt: Date }) => {
                this.goService.gameEnd(this.game, data.finishedAt);
                this.dialog.open(Ng6GoEndGameDialogComponent, {disableClose: true});
            })
        ;
        this.gameService.onNewMove()
            .subscribe((pos: { x: number, y: number }) => {
                this.goService.move(this.game, pos.x, pos.y).subscribe((success) => {
                    if (success) {
                        this.turnAlert();
                    }
                });
            })
        ;
        this.gameService.onSkip()
            .pipe(
                filter((value) => value.gameUuid === this.game.uuid),
                distinctUntilChanged((x, y) => !(x.steps !== y.steps && ((x.playerUuid !== y.playerUuid) || (x.playerUuid === y.playerUuid && (y.steps - x.steps) > 1))))
            )
            .subscribe(({playerUuid}) => {
                this.goService.skip(this.game, playerUuid).subscribe((success) => {
                    if (success) {
                        this.translate.get('ng6-go-board.move.skip').subscribe((message: string) => {
                            this.snackService.warning(message);
                        });
                    }
                });
            })
        ;
    }

    /**
     * When the game is ready, add a stone to DOM if playable.
     * @param x: x coordinate
     * @param y: y coordinate
     */
    public onClick(x: number, y: number): void {
        this.goService.move(this.game, x, y).subscribe((success) => {
            if (success) {
                this.gameService.move(this.game, x, y);
                this.turnAlert();
            } else {
                this.translate.get('ng6-go-board.move.error').subscribe((message: string) => {
                    this.snackService.error(message);
                });
            }
        });
    }

    /**
     * @param num
     */
    public num2letter(num: number): string {
        return this.goService.num2letter(num);
    }

    public playerReady(): void {
        this.goService.playerReady(this.game, this.player.uuid);
    }

    public amIReady(): boolean {
        return this.game.players.find((player) => player.self.uuid === this.player.uuid).ready
    }

    public isOpponentReady(): boolean {
        return this.game.players.every((player) => player.ready === true);
    }

    public skip(): void {
        this.goService.skip(this.game, this.player.uuid).subscribe((success) => {
            if (success) {
                this.gameService.skip(this.game, this.player.uuid);
            }
        });
    }

    private turnAlert(): void {
        let snackBarMessage = null;
        if ((1 === this.game.turn && this.player.uuid === this.game.black) || (-1 === this.game.turn && this.player.uuid === this.game.white)) {
            snackBarMessage = 'ng6-go-board.turn.me';
        } else {
            snackBarMessage = 'ng6-go-board.turn.opponent';
        }
        this.translate.get(snackBarMessage).subscribe((message: string) => {
            this.snackService.default(message);
        });
    }

}
