import {Player} from "../models/player";

export class PlayerController {

    private players: Player[];

    constructor() {
        this.players = [];
    }

    private static getRandomUsername(): string {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * @param nsp
     * @param socket
     */
    public new(nsp: any, socket: any): void {
        const player = new Player(PlayerController.getRandomUsername(), socket.id);
        this.players.push(player);
        nsp.to(socket.id).emit('new_player', player);
    }

    public getByUuid(uuid: string) {
        return this.players.find((player) => player.uuid === uuid);
    }

    public check(nsp: any, socket: any, player: Player): void {
        if(this.players.some((p) => p.uuid === player.uuid && p.name === player.name)){
            nsp.to(socket.id).emit('check_player', true);
        }else if(!this.players.some((p) => p.uuid === player.uuid || p.name === player.name)){
            this.players.push(player);
            nsp.to(socket.id).emit('check_player', true);
        }else{
            nsp.to(socket.id).emit('check_player', false);
        }
    }

}