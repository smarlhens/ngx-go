import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from "@angular/material";

@Injectable({
    providedIn: 'root'
})
export class SnackService {

    private config: MatSnackBarConfig = {duration: 3000};

    constructor(public snackBar: MatSnackBar) {
    }

    public error(message: string, action: string = 'OK', config: MatSnackBarConfig = this.config) {
        config = Object.assign({}, config, {panelClass: ['error']});
        this.snackBar.open(message, action, config);
    }

    public warning(message: string, action: string = 'OK', config: MatSnackBarConfig = this.config) {
        config = Object.assign({}, config, {panelClass: ['warning']});
        this.snackBar.open(message, action, config);
    }

    public success(message: string, action: string = 'OK', config: MatSnackBarConfig = this.config) {
        config = Object.assign({}, config, {panelClass: ['success']});
        this.snackBar.open(message, action, config);
    }

    public default(message: string, action: string = 'OK', config: MatSnackBarConfig = this.config) {
        this.snackBar.open(message, action, config);
    }
}
