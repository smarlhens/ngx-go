import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {distinctUntilChanged, filter, flatMap, take} from "rxjs/operators";
import {Message} from "../../models/message";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'ng6-go-chat',
    templateUrl: './ng6-go-chat.component.html'
})
export class Ng6GoChatComponent implements OnInit {

    sender: string | null;
    message: Message;
    messages: Message[];
    @ViewChild('ng6GoCardMessages') private ng6GoCardMessages: ElementRef;

    constructor(private chatService: ChatService, private userService: UserService) {
        this.message = new Message("");
    }

    public sendMessage(): void {
        if (typeof this.sender !== "undefined" && null !== this.sender && this.sender.trim().length > 0
            && null !== this.message.content && this.message.content.trim().length > 0) {
            // add sender to message
            this.message.sender = this.sender;

            // send message to server
            this.chatService.sendMessage(this.message);

            // add message to view
            this.addMessage(this.message);

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

        this.chatService.getMessages()
            .pipe(
                take(1),
                flatMap((messages: Message[]) => messages),
                filter((message: Message) => typeof message.content !== 'undefined' && typeof message.sender !== 'undefined' && message.content.trim().length > 0 && message.sender !== this.sender),
                distinctUntilChanged((a: Message, b: Message) => a.content === b.content && a.date === b.date && a.sender === b.sender)
            )
            .subscribe((message: Message) => {
                this.addMessage(message);
            });

        this.chatService
            .onNewMessage()
            .pipe(
                filter((message: Message) => typeof message.content !== 'undefined' && typeof message.sender !== 'undefined' && message.content.trim().length > 0 && message.sender !== this.sender),
                distinctUntilChanged((a: Message, b: Message) => a.content === b.content && a.date === b.date && a.sender === b.sender)
            )
            .subscribe((message: Message) => {
                this.addMessage(message)
            });
    }

    private scrollToBottom(): void {
        try {
            this.ng6GoCardMessages.nativeElement.scrollTop = this.ng6GoCardMessages.nativeElement.scrollHeight;
        } catch (err) {
        }
    }

    /**
     * @param message
     */
    private addMessage(message: Message): void {

        const last = this.messages[this.messages.length - 1];
        // if the last message is less than 60 seconds old do not display date
        if (undefined !== last && last.sender === message.sender) {
            const diff = (new Date(last.date)).getTime() - (new Date(message.date)).getTime();
            message.details = Math.round(diff / 1000) > 60;
        } else {
            message.details = true;
        }

        this.messages.push(message);
        this.scrollToBottom();
    }

}
