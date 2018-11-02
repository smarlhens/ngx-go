import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {PlayerService} from "../../services/player.service";
import {Player} from "../../models/player";
import {GameService} from "../../services/game.service";
import {filter, take} from "rxjs/operators";
import {SnackService} from "../../services/snack.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'ng6-go-new-challenge-dialog',
    templateUrl: './ng6-go-new-challenge-dialog.component.html'
})
export class Ng6GoNewChallengeDialogComponent implements OnInit {

    public secondsLeft: number = 30;
    public player: Player;
    private intervalId: any;

    constructor(
        public dialogRef: MatDialogRef<Ng6GoNewChallengeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameUuid: string, challenger: string, challenged: string },
        private playerService: PlayerService,
        private gameService: GameService,
        private snackService: SnackService,
        private translate: TranslateService,
        private router: Router) {
    }

    ngOnInit(): void {
        this.secondsLeft = 30;
        this.playerService.player$.subscribe((player) => this.player = player);
        this.dialogRef.afterOpen().subscribe(() => {
            this.intervalId = setInterval(() => {
                if (this.secondsLeft >= 1) {
                    --this.secondsLeft;
                } else {
                    this.close();
                }
            }, 1000);
        });
        this.gameService.onAcceptChallenge()
            .pipe(
                filter((gameUuid: string) => this.data.gameUuid === gameUuid),
                take(1)
            )
            .subscribe((gameUuid: string) => {
                this.close();
                this.router.navigate(['/game', gameUuid]);
            });
        this.gameService.onRefuseChallenge()
            .pipe(
                filter((gameUuid: string) => this.data.gameUuid === gameUuid),
                take(1)
            )
            .subscribe((gameUuid: string) => {
                this.close();
                this.translate.get('ng6-go-new-challenge-dialog.refuse').subscribe((message: string) => {
                    this.snackService.error(message);
                });
            });
        this.gameService.onCancelChallenge()
            .pipe(
                filter((gameUuid: string) => this.data.gameUuid === gameUuid),
                take(1)
            )
            .subscribe((gameUuid: string) => {
                this.close();
                this.translate.get('ng6-go-new-challenge-dialog.cancel').subscribe((message: string) => {
                    this.snackService.error(message);
                });
            });
    }

    public cancel(): void {
        this.close();
        this.gameService.cancelChallenge(this.data.gameUuid);
    }

    public refuse(): void {
        this.close();
        this.gameService.refuseChallenge(this.data.gameUuid);
    }

    public accept(): void {
        this.close();
        this.gameService.acceptChallenge(this.data.gameUuid);
        this.router.navigate(['/game', this.data.gameUuid]);
    }

    private close(): void {
        clearInterval(this.intervalId);
        this.dialogRef.close();
    }
}
