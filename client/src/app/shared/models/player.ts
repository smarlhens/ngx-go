export class Player {
    public name: string;
    public ready: boolean;
    public socket: string;

    constructor({name, ready, socket}) {
        this.name = name;
        this.ready = ready;
        this.socket = socket;
    }
}
