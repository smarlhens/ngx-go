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
        console.log('new');
        const player = new Player(PlayerController.getRandomUsername(), socket.id);
        this.players.push(player);
        nsp.to(socket.id).emit('new_player', player);
    }

    /**
     * @param uuid
     */
    public getByUuid(uuid: string): Player | null {
        return this.players.find((player) => player.uuid === uuid);
    }

    public check(nsp: any, socket: any, player: Player): void {
        console.log('check');
        if (this.players.some((p) => p.uuid === player.uuid && p.name === player.name)) {
            this.getByUuid(player.uuid).socket = socket.id;
            nsp.to(socket.id).emit('check_player', true);
        } else if (!this.players.some((p) => p.uuid === player.uuid || p.name === player.name)) {
            player.socket = socket.id;
            this.players.push(player);
            nsp.to(socket.id).emit('check_player', true);
        } else {
            nsp.to(socket.id).emit('check_player', false);
        }
    }

    public updatePlayerSocket(socketId: string, playerUuid: string) {
        console.log('updatePlayerSocket');
        let player = this.getByUuid(playerUuid);
        if (typeof player !== "undefined" && null !== player) {
            console.log('updatePlayerSocket: player found');
            player.socket = socketId;
        }
    }

    /**
     * @param nsp
     * @param socket
     * @param playerUuid
     * @param name
     */
    public newName(nsp: any, socket: any, playerUuid: string, name: string) {
        console.log('newName');
        let player = this.getByUuid(playerUuid);
        if (typeof player !== "undefined" && null !== player) {
            if (this.players.find((player: Player) => player.name === name) === undefined) {
                player.name = name;
                nsp.to(socket.id).emit('new_name', name);
            } else {
                nsp.to(socket.id).emit('new_name', player.name);
            }
        }
    }

    public search(nsp: any, socket: any, name: string): void {
        let playersFiltered = this.players;
        if (name.length > 0) {
            playersFiltered = this.players.filter((player) => player.name.includes(name));
        }
        nsp.to(socket.id).emit('search_player', playersFiltered);
    }

    public kickAFKPlayers(onlinePlayers: Player[] = []): void {
        this.players.forEach((player: Player, playerIndex: number) => {
            if (onlinePlayers.every((p: Player) => p.uuid !== player.uuid)) {
                this.players.splice(playerIndex, 1);
            }
        });
    }

}