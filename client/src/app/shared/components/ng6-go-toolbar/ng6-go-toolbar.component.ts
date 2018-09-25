import {Component, NgZone, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Location} from '@angular/common';
import {Router} from "@angular/router";
import {GoService} from "../../services/go.service";
import {Game} from "../../models/game";

@Component({
    selector: 'ng6-go-toolbar',
    templateUrl: './ng6-go-toolbar.component.html'
})
export class Ng6GoToolbarComponent implements OnInit {

    public usernameControl: FormControl;
    public game: Game;

    constructor(private userService: UserService, private zone: NgZone, private location: Location, public router: Router, private goService: GoService) {
        this.usernameControl = new FormControl('', [
            Validators.pattern(/\S+/),
            Validators.pattern(/^[a-zA-Z\u00C0-\u017F\ ]+$/)
        ]);
    }

    ngOnInit(): void {
        this.goService.game.subscribe((game) => this.game = game);
        this.zone.run(() => {
                const randomName = 'joueur_' + Math.random().toString(36).substr(2, 9);
                this.usernameControl.setValue(randomName);
                this.userService.updateUsername(randomName);
            }
        );
        this.usernameControl.valueChanges
            .pipe(debounceTime(250))
            .pipe(distinctUntilChanged())
            .subscribe(username => this.userService.updateUsername(username))
        ;
    }

    public goBack(): void {
        this.location.back();
        this.goService.leaveGame(this.game, this.usernameControl.value);
    }

}
