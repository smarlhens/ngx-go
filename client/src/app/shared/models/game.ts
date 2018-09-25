import {Movement} from "./movement";
import {Player} from "./player";

export class Game {
    black: string | null;
    white: string | null;
    // board dimensions
    dimension: number = 19;
    handicaps: number;
    // board grid
    grid: number[][];
    sequence: number[][];
    steps: number = 0;
    history: Movement[] = [];
    lines;
    stars;
    players: Player[] = [];
    // 1: black; -1: white; 0: empty
    turn: number = 0;
    // freeze the board if inactive
    active: boolean = false;
    id: string;

    constructor(id: string) {
        this.id = id;
    }

}
