import {NgModule} from '@angular/core';

import {
    MdcButtonModule,
    MdcFabModule,
    MdcIconButtonModule,
    MdcIconModule,
    MdcRippleModule,
    MdcTextFieldModule,
    MdcTypographyModule,
    MdcChipsModule
} from '@angular-mdc/web';

@NgModule({
    exports: [
        MdcButtonModule,
        MdcFabModule,
        MdcIconModule,
        MdcTextFieldModule,
        MdcRippleModule,
        MdcTypographyModule,
        MdcIconButtonModule,
        MdcChipsModule
    ]
})
export class MdcModule {
}


