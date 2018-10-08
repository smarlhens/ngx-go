import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {NamespaceService} from "./namespace.service";
import {filter, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private usernameSource = new BehaviorSubject<string>(null);
    public username = this.usernameSource.asObservable();

    constructor(private nsService: NamespaceService) {
    }

    /**
     * @param username
     */
    public updateUsername(username: string | null): void {
        if (typeof window.localStorage !== 'undefined' && username !== window.localStorage.getItem('username')) {
            window.localStorage.setItem('username', username);
        }
        this.usernameSource.next(username);
    }

    public initUsername(): void {
        if (typeof window.localStorage !== 'undefined' && null !== window.localStorage.getItem('username')) {
            this.usernameSource.next(window.localStorage.getItem('username'));
        } else {
            this.nsService.socket.emit('get_username');
            this.onNewUsername().pipe(
                take(1),
                filter((username: string) => (new RegExp('^(player_){1}([a-zA-Z0-9]{9})$')).test(username))
            ).subscribe((username: string) => {
                this.usernameSource.next(username);
            })
        }
    }

    private onNewUsername() {
        return Observable.create((observer) => {
            this.nsService.socket.on('get_username', (username: string) => {
                observer.next(username);
            });
        });
    }

}
