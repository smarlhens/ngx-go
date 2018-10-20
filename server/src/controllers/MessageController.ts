import {Message} from "../models/message";
import {GameController} from "./GameController";

export class MessageController {

    private messages: any;
    private defaultNS = 'default';

    constructor(private gameController: GameController) {
        this.messages = [];
        this.init();
    }

    public new(nsp: any, socket: any, message: Message, ns = this.defaultNS) {
        this.init(ns);
        // get last message
        const last = this.messages[ns][this.messages[ns].length - 1];

        // check if new and last this.messages are distinct
        if (undefined === last || (undefined !== last && !(last.content === message.content && last.date === message.date && last.sender === message.sender))) {
            socket.join('chat');
            this.messages[ns].push(message);

            if (ns === this.defaultNS) {
                // send new message to all clients except sender
                socket.broadcast.to('chat').emit('new_message', message);
            } else {
                const game = this.gameController.getById(ns);
                if (typeof game !== "undefined" && null !== game) {
                    // get the opponent if exist
                    const opponent = game.players.find((player) => player.socket !== socket.id);
                    console.log(opponent);
                    if (typeof opponent !== "undefined") {
                        // send new message to the opponent
                        nsp.to(opponent.socket).emit('new_message', message);
                    }
                }
            }
        }
    }

    public getAll(nsp: any, socket: any, ns = this.defaultNS) {
        this.init(ns);
        console.log('get_messages');
        nsp.to(socket.id).emit('get_messages', this.messages[ns]);
    }

    private init(ns = this.defaultNS) {
        if (typeof this.messages[ns] === 'undefined') {
            this.messages[ns] = [];
        }
    }

}