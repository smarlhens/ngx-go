import {Player} from "./player";

export class Message {
    public sender: Player;
    public content: string;
    public date: Date;

    constructor(content) {
        this.content = content;
    }
}
