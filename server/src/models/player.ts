import uuid = require('uuid');

export class Player {
    public uuid: string;
    public name: string;
    public socket: string;

    constructor(name, socket) {
        this.uuid = uuid.v4();
        this.name = name;
        this.socket = socket;
    }
}
