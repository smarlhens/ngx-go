import {Game} from "../models/game";

export class GameController {

    private games: Game[];

    constructor() {
        this.games = [];
    }

    /**
     * @param socket
     * @param id
     */
    public new(socket: any, id: string): void {
        if (!this.getById(id)) {
            this.games.push(new Game(id));
            socket.join('game');
            // send new game to all clients except sender
            socket.broadcast.to('game').emit('new_game', id);
        }
    }

    /**
     * @param nsp
     * @param socket
     */
    public getPendingGames(nsp: any, socket: any): void {
        socket.join('game');
        // send all this.games to the sender
        nsp.to(socket.id).emit('get_available_games', this.games.filter((game) => game.players.length < 2 && !game.active));
    }

    /**
     * @param id
     */
    public getById(id: string): Game {
        return this.games.find((game) => game.id === id)
    }

    /**
     * @param id
     */
    public getIndexById(id: string): number {
        return this.games.findIndex((game) => game.id === id);
    }

    /***
     * @param io
     */
    public deleteOldGames(io: any): void {
        if (typeof this.games !== "undefined" && null !== this.games && this.games.length > 0) {
            this.games.forEach((game, gameIndex) => {
                if (typeof game !== "undefined" && null !== game && (game.players.length === 0 || Math.round(((new Date()).getTime() - game.createdAt.getTime()) / 60000) >= 10)) {
                    io.of('/').emit('delete_game', game.id);
                    this.games.splice(gameIndex, 1);
                }
            });
        }
    }

    /**
     * @param io
     * @param nsp
     * @param socket
     * @param id
     * @param name
     */
    public join(io: any, nsp: any, socket: any, id: string, name: string): void {
        const game = this.getById(id);
        if (typeof game !== "undefined" && null !== game && !game.players.find((player) => player.name === name) && game.players.length < 2 && !game.active) {
            game.players.push({'name': name, 'ready': false, 'socket': socket.id});
            console.log(game);
            socket.join('game');
            console.log('join_game');
            // get the opponent if exist
            const opponent = game.players.find((player) => player.name !== name);
            if (typeof opponent !== "undefined") {
                nsp.to(socket.id).emit('join_game', opponent.name);
                nsp.to(opponent.socket).emit('join_game', name);
                console.log('game_ready');
                io.to('game').emit('game_ready', id);
            }
        }
    }

    /**
     * @param io
     * @param nsp
     * @param socket
     * @param id
     * @param name
     */
    public leave(io: any, nsp: any, socket: any, id: string, name: string) {
        const gameIndex = this.getIndexById(id);
        const game = this.games[gameIndex];
        if (-1 !== gameIndex && typeof game !== "undefined" && null !== game && !game.active) {
            const playerIndex = game.players.findIndex((player) => player.name === name);
            if (-1 !== playerIndex) {
                socket.join('game');
                game.players.splice(playerIndex, 1);
                console.log('leave_game');

                // get the opponent if exist
                const opponent = game.players.find((player) => player.name !== name);
                if (typeof opponent !== "undefined") {
                    nsp.to(opponent.socket).emit('leave_game', name);
                    console.log('game_pending');
                    io.to('game').emit('game_pending', id);
                }

                if (game.players.length === 0) {
                    this.deleteById(io, nsp, id);
                }
            }
        }
    }

    /**
     * @param io
     * @param nsp
     * @param id
     */
    public deleteById(io: any, nsp: any, id: string) {
        console.log('delete_game');
        io.to('game').emit('delete_game', id);
        this.games.splice(this.getIndexById(id), 1);
    }
}