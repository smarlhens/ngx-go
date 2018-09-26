import {Component, OnInit} from '@angular/core';
import {Game} from "../../models/game";
import {GoService} from "../../services/go.service";

@Component({
    selector: 'ng6-go-overview',
    templateUrl: './ng6-go-overview.component.html'
})
export class Ng6GoOverviewComponent implements OnInit {

    public game: Game;

    constructor(private goService: GoService) {
    }

    ngOnInit() {
        this.goService.game.subscribe((game) => this.game = game);
    }

}
