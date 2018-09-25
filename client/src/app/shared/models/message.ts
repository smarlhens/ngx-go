export class Message {
    public sender: string;
    public content: string;
    public date: Date;

    constructor(content) {
        this.content = content;
    }
}
