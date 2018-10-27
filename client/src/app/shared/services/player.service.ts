import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {NamespaceService} from "./namespace.service";
import {filter, take} from "rxjs/operators";
import {Player} from "../models/player";

@Injectable({
    providedIn: 'root'
})
export class PlayerService {

    public player: Player;
    private playerSource = new BehaviorSubject<Player>(null);
    public player$ = this.playerSource.asObservable();

    constructor(private nsService: NamespaceService) {
        this.playerSource.next(this.player = new Player());
    }

    /**
     * @param name
     */
    public updateName(name: string | null): void {
        if (typeof window.localStorage !== 'undefined' && name !== window.localStorage.getItem('name')) {
            window.localStorage.setItem('name', name);
        }
        this.player.name = name;
        this.playerSource.next(this.player);
    }

    public initUser(): void {
        if (typeof window.localStorage !== 'undefined'
            && null !== window.localStorage.getItem('uuid')
            && null !== window.localStorage.getItem('name')
        ) {
            this.player.uuid = window.localStorage.getItem('uuid');
            this.player.name = window.localStorage.getItem('name');
            this.playerSource.next(this.player);
            this.nsService.socket.emit('check_player', this.player);
            this.onCheckPlayer().subscribe((check: boolean) => {
                if (check === false) {
                    window.localStorage.removeItem('uuid');
                    window.localStorage.removeItem('name');
                    this.initUser();
                }
            });
        } else {
            this.nsService.socket.emit('new_player');
            this.onNewPlayer().pipe(
                take(1),
                filter((player: Player) => (new RegExp('^(player_){1}([a-zA-Z0-9]{9})$')).test(player.name))
            ).subscribe((player: Player) => {
                this.player = player;
                window.localStorage.setItem('uuid', player.uuid);
                window.localStorage.setItem('name', player.name);
                window.localStorage.setItem('socket', player.socket);
                this.playerSource.next(this.player);
            });
        }
    }

    public newName(playerUuid: string, name: string): void {
        this.nsService.socket.emit('new_name', playerUuid, name);
    }

    public onNewName(): Observable<string> {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_name', (name: string) => {
                observer.next(name);
            });
        });
    }

    private onNewPlayer(): Observable<Player> {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_player', (player: Player) => {
                observer.next(player);
            });
        });
    }

    private onCheckPlayer(): Observable<boolean> {
        return Observable.create((observer) => {
            this.nsService.socket.on('check_player', (check: boolean) => {
                observer.next(check);
            });
        });
    }

}
