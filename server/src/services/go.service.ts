import {Game} from "../models/game";
import {Movement} from "../models/movement";
import {Observable} from "rxjs";

export class GoService {

    constructor() {
    }

    /**
     * Check if a position is playable by a color.
     * @param game
     * @param x: x coordinate
     * @param y: y coordinate
     * @param c: color
     */
    public static isPlayable(game: Game, x: number, y: number, c: number): boolean {
        if (game.grid[x][y] != 0) {
            return false;
        }
        if (game.history !== undefined && game.history.length > 1
            && game.history[game.history.length - 1].remove.find((move: any) => move.x === x && move.y === y && move.c === c)) {
            return false;
        }
        game.grid[x][y] = c;
        if (GoService.countLiberties(game, x, y) > 0) {
            game.grid[x][y] = 0;
            return true;
        }
        let neighborGroups = GoService.getNeighbors(game, x, y);
        for (let i = 0; i < neighborGroups.length; i++) {
            if (GoService.countGroupLiberties(game, neighborGroups[i]) === 0) {
                game.grid[x][y] = 0;
                return true;
            }
        }
        game.grid[x][y] = 0;
        return false;
    }

    /**
     * Helper to get the first key of an object, return null if empty.
     * @param obj: object
     */
    private static getFirst(obj): string {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return prop;
            }
        }
        return null;
    }

    /**
     * Helper to check if an object is empty.
     * @param obj: object
     */
    private static isEmpty(obj): boolean {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) return false;
        }
        return JSON.stringify(obj) === JSON.stringify({});
    }

    /**
     * Helper to get the length of an object.
     * @param obj: object
     */
    private static getLength(obj): number {
        let length = 0;
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) length++;
        }
        return length;
    }

    /**
     * Helper to stringify a position object (<e.g.> {x: 1, y: 2}) to a string (<e.g.> "1,2").
     * @param pos: a position object
     */
    private static pos2str(pos): string {
        return pos.x + "," + pos.y;
    }

    /**
     * Helper to de-stringify a string (<e.g.> "1,2") to a position object (<e.g.> {x: 1, y: 2}).
     * @param str: string representation of a position object
     */
    private static str2pos(str: string): { x: number; y: number } {
        let res = str.split(",");
        return {x: parseInt(res[0]), y: parseInt(res[1])};
    }

    /**
     * Helper to generate a dim*dim 2D array.
     * @param dim: dimension
     */
    private static createGrid(dim: number): number[][] {
        let board = [];
        for (let i = 0; i < dim; i++) {
            board[i] = [];
            for (let j = 0; j < dim; j++) {
                board[i][j] = 0;
            }
        }
        return board;
    }

    /**
     * Helper to get lines of the board grid for svg drawing.
     * @param dim: dimension
     */
    private static getLines(dim: number): { a: number; b: number }[] {
        let lines = [];
        let end = 500 * dim - 240;
        for (let i = 0; i < dim; i++) {
            lines.push({a: 500 * i + 250, b: end});
        }
        return lines;
    }

    /**
     * Helper to get circles of the board stars for svg drawing.
     * @param dim: dimension
     */
    private static getStars(dim: number): { x: number; y: number }[] {
        let stars = [];
        if (19 === dim) {
            stars.push(
                {x: 250 + 500 * 3, y: 250 + 500 * 3},
                {x: 250 + 500 * 9, y: 250 + 500 * 3},
                {x: 250 + 500 * 15, y: 250 + 500 * 3},
                {x: 250 + 500 * 3, y: 250 + 500 * 9},
                {x: 250 + 500 * 9, y: 250 + 500 * 9},
                {x: 250 + 500 * 15, y: 250 + 500 * 9},
                {x: 250 + 500 * 3, y: 250 + 500 * 15},
                {x: 250 + 500 * 9, y: 250 + 500 * 15},
                {x: 250 + 500 * 15, y: 250 + 500 * 15});
        } else if (dim == 13) {
            stars.push(
                {x: 250 + 500 * 3, y: 250 + 500 * 3},
                {x: 250 + 500 * 3, y: 250 + 500 * 9},
                {x: 250 + 500 * 9, y: 250 + 500 * 3},
                {x: 250 + 500 * 9, y: 250 + 500 * 9});
        } else if (dim == 9) {
            stars.push(
                {x: 250 + 500 * 4, y: 250 + 500 * 4});
        }
        return stars;
    }

    /**
     * Check if a position is on the board.
     * @param game
     * @param x: x coordinate
     * @param y: y coordinate
     */
    private static isOnBoard(game: Game, x: number, y: number): boolean {
        return !(x >= game.dimension || y >= game.dimension || x < 0 || y < 0);
    }

    /**
     * Get the group where the input position resides.
     * @param game
     * @param x: x coordinate
     * @param y: y coordinate
     */
    private static getSelfGroup(game: Game, x: number, y: number): { [p: string]: boolean } {
        let color = game.grid[x][y];
        let explore = {};
        let visited: { [strName: string]: boolean } = {};
        explore[x + "," + y] = true;
        while (!GoService.isEmpty(explore)) {
            let str = GoService.getFirst(explore);
            let pos = GoService.str2pos(str);
            let adjacent = [{x: pos.x - 1, y: pos.y}, {x: pos.x + 1, y: pos.y},
                {x: pos.x, y: pos.y + 1}, {x: pos.x, y: pos.y - 1}];
            visited[str] = true;
            delete explore[str];
            for (let i = 0; i < 4; i++) {
                let currStr = GoService.pos2str(adjacent[i]);
                let currX = adjacent[i].x;
                let currY = adjacent[i].y;
                if (GoService.isOnBoard(game, currX, currY) && color === game.grid[currX][currY]
                    && !visited[currStr] && !explore[currStr]) {
                    explore[currStr] = true;
                }
            }
        }
        return visited;
    }

    /**
     * Count the liberties of a group where the input position resides.
     * @param game
     * @param x: x coordinate
     * @param y: y coordinate
     */
    private static countLiberties(game: Game, x: number, y: number): number {
        let group = GoService.getSelfGroup(game, x, y);
        return GoService.countGroupLiberties(game, group);
    }

    /**
     * Count the liberties of a group.
     * @param game
     * @param group: a group of stones
     */
    private static countGroupLiberties(game: Game, group): number {
        let explore = {};
        for (let prop in group) {
            if (group.hasOwnProperty(prop)) {
                explore[prop] = true;
            }
        }
        let liberties = {};
        while (!GoService.isEmpty(explore)) {
            let str = GoService.getFirst(explore);
            let pos = GoService.str2pos(str);
            let adjacent = [{x: pos.x - 1, y: pos.y}, {x: pos.x + 1, y: pos.y},
                {x: pos.x, y: pos.y + 1}, {x: pos.x, y: pos.y - 1}];
            delete explore[str];
            for (let i = 0; i < 4; i++) {
                let currStr = GoService.pos2str(adjacent[i]);
                let currX = adjacent[i].x;
                let currY = adjacent[i].y;
                if (GoService.isOnBoard(game, currX, currY) && 0 === game.grid[currX][currY]
                    && !liberties[currStr]) {
                    liberties[currStr] = true;
                }
            }
        }
        return GoService.getLength(liberties);
    }

    /**
     * Get an array of groups which are input position's group's neighbors.
     * @param game
     * @param x: x coordinate
     * @param y: y coordinate
     */
    private static getNeighbors(game: Game, x: number, y: number): { [p: string]: boolean }[] {
        let color = game.grid[x][y];
        let group = GoService.getSelfGroup(game, x, y);
        let neighborStones = {};
        let neighborGroups = [];
        while (!GoService.isEmpty(group)) {
            let str = GoService.getFirst(group);
            let pos = GoService.str2pos(str);
            let adjacent = [{x: pos.x - 1, y: pos.y}, {x: pos.x + 1, y: pos.y},
                {x: pos.x, y: pos.y + 1}, {x: pos.x, y: pos.y - 1}];
            delete group[str];
            for (let i = 0; i < 4; i++) {
                let currStr = GoService.pos2str(adjacent[i]);
                let currX = adjacent[i].x;
                let currY = adjacent[i].y;
                if (GoService.isOnBoard(game, currX, currY) && game.grid[currX][currY] === -color
                    && !neighborStones[currStr]) {
                    neighborStones[currStr] = true;
                }
            }
        }
        while (!GoService.isEmpty(neighborStones)) {
            let str = GoService.getFirst(neighborStones);
            let pos = GoService.str2pos(str);
            let neighborGroup = GoService.getSelfGroup(game, pos.x, pos.y);
            for (let prop in neighborGroup) {
                if (neighborGroup.hasOwnProperty(prop)) {
                    delete neighborStones[prop];
                }
            }
            neighborGroups.push(neighborGroup);
        }
        return neighborGroups;
    }

    /**
     * Helper to convert a number to a letter.
     * @param num: a number >= 1 && <= 26
     */
    public num2letter(num: number): string {
        if (num >= 1 && num <= 26) {
            return String.fromCharCode(64 + num);
        }
        return "";
    }

    /**
     * Helper to create game.
     */
    public createGame(uuid: string, config: any = {dimension: 19, handicaps: 0}): Game {
        const game = new Game(uuid);
        game.dimension = config.dimension;
        game.handicaps = config.handicaps;
        game.grid = GoService.createGrid(game.dimension);
        game.sequence = GoService.createGrid(game.dimension);
        game.lines = GoService.getLines(game.dimension);
        game.stars = GoService.getStars(game.dimension);
        return game;
    }

    /**
     * Helper to start game
     */
    public gameStart(game: Game, playerUuid: string): void {
        game.active = true;
        game.turn = 1;
        let player = game.players.find((p) => p.self.uuid === playerUuid);
        if (player && player.ready) {
            game.black = player.self.uuid;
            let opponent = game.players.find((player) => player.self.uuid !== playerUuid);
            if (typeof opponent !== "undefined") {
                game.white = opponent.self.uuid;
            }
        }
    }

    /**
     * @param game
     * @param x: x coordinate
     * @param y: y coordinate
     */
    public move(game: Game, x: number, y: number): Observable<boolean> {
        if (GoService.isPlayable(game, x, y, game.turn)) {
            let movement = new Movement([{x: x, y: y, c: game.turn, s: game.steps + 1}], [], null);
            game.sequence[x][y] = game.steps + 1;
            game.grid[x][y] = game.turn;
            let neighborGroups = GoService.getNeighbors(game, x, y);
            for (let i = 0; i < neighborGroups.length; i++) {
                if (GoService.countGroupLiberties(game, neighborGroups[i]) === 0) {
                    for (let prop in neighborGroups[i]) {
                        if (neighborGroups[i].hasOwnProperty(prop)) {
                            let pos = GoService.str2pos(prop);
                            game.grid[pos.x][pos.y] = 0;
                            movement.remove.push({x: pos.x, y: pos.y, c: -game.turn, s: game.sequence[pos.x][pos.y]});
                            game.sequence[pos.x][pos.y] = 0;
                        }
                    }
                }
            }
            game.steps += 1;
            game.turn = game.steps >= game.handicaps ? -game.turn : game.turn;
            movement.turn = game.turn;
            game.history.push(movement);
            return Observable.create((observer) => observer.next(true));
        }
        return Observable.create((observer) => observer.next(false));
    }

    /**
     * Skip turn
     * @param game
     * @param playerUuid
     */
    public skip(game: Game, playerUuid: string): Observable<boolean> {
        if (game.players.find((p) => p.self.uuid === playerUuid)
            && ((game.turn === 1 && playerUuid === game.black) || (game.turn === -1 && playerUuid === game.white))) {
            let movement = new Movement([], [], null);
            game.steps += 1;
            game.turn = game.steps >= game.handicaps ? -game.turn : game.turn;
            movement.turn = game.turn;
            game.history.push(movement);
            return Observable.create((observer) => observer.next(true));
        }
        return Observable.create((observer) => observer.next(false));
    }
}
