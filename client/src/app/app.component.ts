import {Component} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../environments/environment";
import {PlayerService} from "./shared/services/player.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    constructor(private translate: TranslateService, private playerService: PlayerService) {
        this.translate.addLangs(['en', 'fr']);
        this.translate.setDefaultLang(environment.locale);
        this.playerService.initUser();
    }
}
