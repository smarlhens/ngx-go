import {Component, OnInit} from '@angular/core';
import {GoService} from "../../shared/services/go.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../shared/services/user.service";
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {

    private username: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private goService: GoService,
        private userService: UserService,
        private titleService: Title
    ) {
    }

    ngOnInit(): void {
        this.userService.username.subscribe((username) => this.username = username);
        let id = this.route.snapshot.paramMap.get('id');
        if (null === id) {
            this.router.navigate(['/']);
        }
        this.titleService.setTitle('Game '+id);
        const game = this.goService.createGame(id);
        this.goService.joinGame(game, this.username);
    }
}
