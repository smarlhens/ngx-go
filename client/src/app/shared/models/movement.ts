export class Movement {
    add: any = [];
    remove: any = [];
    turn: number | null;

    constructor(add = [], remove = [], turn = null) {
        this.add = add;
        this.remove = remove;
        this.turn = turn;
    }

}
