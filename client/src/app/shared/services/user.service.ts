import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private usernameSource = new BehaviorSubject<string>(null);
    public username = this.usernameSource.asObservable();

    constructor() {
    }

    /**
     * @param username
     */
    public updateUsername(username: string | null): void {
        this.usernameSource.next(username);
    }
}
