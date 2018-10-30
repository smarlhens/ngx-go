export class Movement {
    add: { x: number, y: number, c: number, s: any }[] = [];
    remove: { x: number, y: number, c: number, s: any }[] = [];
    turn: number | null;

    constructor(add = [], remove = [], turn = null) {
        this.add = add;
        this.remove = remove;
        this.turn = turn;
    }

}
