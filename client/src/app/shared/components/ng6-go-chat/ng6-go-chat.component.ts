import {Component, OnInit} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {distinctUntilChanged, filter, flatMap, take} from "rxjs/operators";
import {Message} from "../../models/message";
import {UserService} from "../../services/user.service";
import {GoService} from "../../services/go.service";
import {Game} from "../../models/game";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'ng6-go-chat',
    templateUrl: './ng6-go-chat.component.html'
})
export class Ng6GoChatComponent implements OnInit {

    public sender: string | null;
    public messages: Message[];
    public message: Message;
    public locale = environment.locale;
    private game: Game;

    constructor(
        private chatService: ChatService,
        private userService: UserService,
        private goService: GoService
    ) {
        this.message = new Message("");
    }

    public displayDate(previous: Message = null, current: Message): boolean {
        if (undefined !== previous && null !== previous) {
            const diffWithPrevious = (new Date(current.date)).getTime() - (new Date(previous.date)).getTime();

            // or if the last message is less than 60 seconds old do not display date
            return Math.round(diffWithPrevious / 1000) > 60;
        } else {
            return true;
        }
    }

    public sendMessage(): void {
        if (typeof this.sender !== "undefined" && null !== this.sender && this.sender.trim().length > 0
            && null !== this.message.content && this.message.content.trim().length > 0) {
            // add sender to message
            this.message.sender = this.sender;

            // send message to server
            this.chatService.sendMessage(this.message, this.game);

            // add message to view
            this.messages.push(this.message);

            // reset message
            this.message = new Message("");
        }
    }

    ngOnInit(): void {
        this.messages = [];
        this.userService.username
            .pipe(
                distinctUntilChanged()
            )
            .subscribe((username) => this.sender = username);
        this.goService.game.subscribe((game) => this.game = game);
        this.chatService.getMessages()
            .pipe(
                take(1),
                flatMap((messages: Message[]) => messages),
                filter((message: Message) => typeof message.content !== 'undefined' && typeof message.sender !== 'undefined' && message.content.trim().length > 0 && message.sender !== this.sender),
                distinctUntilChanged((a: Message, b: Message) => a.content === b.content && a.date === b.date && a.sender === b.sender)
            )
            .subscribe((message: Message) => {
                this.messages.push(message);
            })
        ;

        this.chatService
            .onNewMessage()
            .pipe(
                filter((message: Message) => typeof message.content !== 'undefined' && typeof message.sender !== 'undefined' && message.content.trim().length > 0 && message.sender !== this.sender),
                distinctUntilChanged((a: Message, b: Message) => a.content === b.content && a.date === b.date && a.sender === b.sender)
            )
            .subscribe((message: Message) => {
                this.messages.push(message)
            })
        ;
    }

}
