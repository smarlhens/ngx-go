import {Component, OnInit} from '@angular/core';
import {Player} from "../../models/player";
import {GameService} from "../../services/game.service";
import {PlayerService} from "../../services/player.service";
import {FormControl, Validators} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {MatDialog} from "@angular/material";
import {Ng6GoNewChallengeDialogComponent} from "../ng6-go-new-challenge-dialog/ng6-go-new-challenge-dialog.component";

@Component({
    selector: 'ng6-go-search',
    templateUrl: './ng6-go-search.component.html'
})
export class Ng6GoSearchComponent implements OnInit {

    public players: Player[] = [];
    public playersRendered: Observable<Player[]>;
    public searchControl: FormControl;
    public loading: boolean = false;

    constructor(
        private gameService: GameService,
        private playerService: PlayerService,
        private dialog: MatDialog
    ) {
        this.searchControl = new FormControl('', [
            Validators.pattern(/\S+/),
            Validators.pattern(/^[0-9a-zA-Z\u00C0-\u017F\ ]+$/)
        ]);
    }

    ngOnInit() {
        this.loading = false;
        this.search();
        this.searchControl.valueChanges
            .pipe(
                debounceTime(250),
                distinctUntilChanged()
            )
            .subscribe(search => this.search(search))
        ;
        this.playerService.onSearchResult()
            .subscribe((players: Player[]) => {
                if (typeof players !== "undefined" && null !== players && players.length > 0) {
                    this.players = players.filter((player) => player.uuid !== this.playerService.player.uuid);
                } else {
                    this.players = [];
                }
                this.playersRendered = of(this.players);
                this.loading = false;
            });
        this.gameService.onNewChallenge()
            .pipe(
                distinctUntilChanged((a: { gameUuid: string, challenger: string, challenged: string }, b: { gameUuid: string, challenger: string, challenged: string }) => a.gameUuid === b.gameUuid)
            )
            .subscribe((data: { gameUuid: string, challenger: string, challenged: string }) => {
                    this.dialog.open(Ng6GoNewChallengeDialogComponent, {data: data, disableClose: true});
                }
            );
    }

    public search(search: string = ''): void {
        this.loading = true;
        this.playerService.search(search);
    }

    public newChallenge(playerUuid: string): void {
        this.gameService.newChallenge(this.playerService.player.uuid, playerUuid);
    }

}
