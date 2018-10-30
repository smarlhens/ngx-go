import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {PlayerService} from "../../services/player.service";
import {debounceTime, distinctUntilChanged, filter} from "rxjs/operators";
import {Location} from '@angular/common';
import {GoService} from "../../services/go.service";
import {Game} from "../../models/game";
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";
import {Player} from "../../models/player";
import {SnackService} from "../../services/snack.service";

@Component({
    selector: 'ng6-go-toolbar',
    templateUrl: './ng6-go-toolbar.component.html'
})
export class Ng6GoToolbarComponent implements OnInit {

    public usernameControl: FormControl;
    public game: Game;
    private player: Player;

    constructor(
        private playerService: PlayerService,
        private zone: NgZone,
        private location: Location,
        public router: Router,
        public snackService: SnackService,
        private goService: GoService
    ) {
        this.usernameControl = new FormControl('', [
            Validators.minLength(4),
            Validators.pattern(/\S+/),
            Validators.pattern(/^[a-zA-Z\u00C0-\u017F\ ]+$/)
        ]);
    }

    ngOnInit(): void {
        this.goService.game$.subscribe((game) => this.game = game);
        this.playerService.player$.subscribe((player: Player) => {
            this.player = player;
            this.usernameControl.setValue(player.name);
        });
        this.usernameControl.valueChanges
            .pipe(
                debounceTime(250),
                filter((name: string) => name !== this.player.name),
                filter((name: string) => {
                    if (name.length < 4) {
                        this.snackService.error('Le pseudo doit contenir au moins 4 charactères.');
                    }
                    return name.length >= 4;
                }),
                distinctUntilChanged()
            )
            .subscribe(name => this.playerService.newName(this.player.uuid, name))
        ;
        this.playerService.onNewName().subscribe(
            (name: string) => {
                if (name === this.player.name) {
                    this.snackService.error('Le pseudo choisit n\'est pas disponible.');
                    this.usernameControl.setValue(this.player.name);
                } else {
                    this.snackService.success('Le pseudo a été mis à jour avec succès.');
                    this.playerService.updateName(name);
                    this.usernameControl.setValue(name);
                }
            });
    }

    public goBack(): void {
        this.location.back();
        this.goService.leaveGame(this.game, this.player.uuid);
    }

    public disableLocale(locale: string): boolean {
        return environment.locale === locale;
    }

}
