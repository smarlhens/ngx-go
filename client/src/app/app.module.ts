import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HomeComponent} from './components/home/home.component';
import {AppRoutingModule} from './app-routing.module';
import {Ng6GoNavComponent} from './shared/components/ng6-go-nav/ng6-go-nav.component';
import {LayoutModule} from '@angular/cdk/layout';
import {MaterialModule} from './material.module';
import {MdcModule} from './mdc.module';
import {GameComponent} from './components/game/game.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Ng6GoChatComponent} from './shared/components/ng6-go-chat/ng6-go-chat.component';
import {Ng6GoGamesComponent} from './shared/components/ng6-go-games/ng6-go-games.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import {Ng6GoBoardComponent} from './shared/components/ng6-go-board/ng6-go-board.component';
import {Ng6GoToolbarComponent} from './shared/components/ng6-go-toolbar/ng6-go-toolbar.component';
import {Ng6GoOverviewComponent} from './shared/components/ng6-go-overview/ng6-go-overview.component';
import {registerLocaleData} from "@angular/common";
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import {environment} from "../environments/environment";

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        Ng6GoNavComponent,
        GameComponent,
        Ng6GoChatComponent,
        Ng6GoGamesComponent,
        Ng6GoBoardComponent,
        Ng6GoToolbarComponent,
        Ng6GoOverviewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        LayoutModule,
        MaterialModule,
        MdcModule,
        FormsModule,
        FlexLayoutModule,
        ReactiveFormsModule
    ],
    bootstrap: [AppComponent],
    providers: [{provide: LOCALE_ID, useValue: environment.locale}]
})
export class AppModule {
}
