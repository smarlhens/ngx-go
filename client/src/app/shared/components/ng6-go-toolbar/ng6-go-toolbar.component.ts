import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {PlayerService} from "../../services/player.service";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Location} from '@angular/common';
import {GoService} from "../../services/go.service";
import {Game} from "../../models/game";
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";
import {Player} from "../../models/player";

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
        private goService: GoService
    ) {
        this.usernameControl = new FormControl('', [
            Validators.pattern(/\S+/),
            Validators.pattern(/^[a-zA-Z\u00C0-\u017F\ ]+$/)
        ]);
    }

    ngOnInit(): void {
        this.usernameControl.disable();
        this.goService.game$.subscribe((game) => this.game = game);
        this.playerService.player$.subscribe((player: Player) => {
            this.player = player;
            this.usernameControl.setValue(player.name);
        });
        this.usernameControl.valueChanges
            .pipe(debounceTime(250))
            .pipe(distinctUntilChanged())
            .subscribe(username => this.playerService.updateName(username))
        ;
    }

    public goBack(): void {
        this.location.back();
        this.goService.leaveGame(this.game, this.player.uuid);
    }

    public disableLocale(locale: string): boolean {
        return environment.locale === locale;
    }

}
