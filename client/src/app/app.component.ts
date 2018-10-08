import {Component} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../environments/environment";
import {UserService} from "./shared/services/user.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    constructor(private translate: TranslateService, private userService: UserService) {
        this.translate.addLangs(['en', 'fr']);
        this.translate.setDefaultLang(environment.locale);
        this.userService.initUsername();
    }
}
