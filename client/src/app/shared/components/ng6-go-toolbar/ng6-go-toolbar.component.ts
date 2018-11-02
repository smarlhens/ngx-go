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
import {TranslateService} from "@ngx-translate/core";

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
        private translate: TranslateService,
        private goService: GoService
    ) {
        this.usernameControl = new FormControl('', [
            Validators.minLength(3),
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
                debounceTime(500),
                filter((name: string) => name !== this.player.name),
                filter((name: string) => {
                    if (name.length < 3) {
                        this.translate.get('ng6-go-toolbar.form.username.length').subscribe((message: string) => {
                            this.snackService.error(message);
                        });
                    }
                    return name.length >= 3;
                }),
                distinctUntilChanged()
            )
            .subscribe(name => this.playerService.newName(this.player.uuid, name))
        ;
        this.playerService.onNewName().subscribe(
            (name: string) => {
                if (name === this.player.name) {
                    this.translate.get('ng6-go-toolbar.form.username.error').subscribe((message: string) => {
                        this.snackService.error(message);
                    });
                    this.usernameControl.setValue(this.player.name);
                } else {
                    this.translate.get('ng6-go-toolbar.form.username.success').subscribe((message: string) => {
                        this.snackService.success(message);
                    });
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
