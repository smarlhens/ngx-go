export class Message {
    public sender: string;
    public content: string;
    public date: Date;
    public details: boolean;

    constructor(content) {
        this.content = content;
        this.details = true;
    }
}
