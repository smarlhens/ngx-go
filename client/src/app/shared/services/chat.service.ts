import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Message} from "../models/message";
import * as moment from "moment";
import {NamespaceService} from "./namespace.service";
import {Game} from "../models/game";

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(private nsService: NamespaceService) {
    }

    /**
     * @param message
     * @param game
     */
    public sendMessage(message: Message, game: Game = null) {
        message.date = moment().toDate();
        this.nsService.socket.emit('new_message', message, (null !== game ? game.uuid : null));
    }

    public onNewMessage() {
        return Observable.create((observer) => {
            this.nsService.socket.on('new_message', (message: Message) => {
                observer.next(message);
            });
        });
    }

    public getMessages() {
        this.nsService.socket.emit('get_messages');
        return Observable.create((observer) => {
            this.nsService.socket.on('get_messages', (messages: Message[]) => {
                observer.next(messages);
            });
        });
    }

}
