"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(id) {
        // board dimensions
        this.dimension = 19;
        this.steps = 0;
        this.history = [];
        this.players = [];
        // 1: black; -1: white; 0: empty
        this.turn = 0;
        // freeze the board if inactive
        this.active = false;
        this.createdAt = new Date();
        this.id = id;
    }
}
exports.Game = Game;
//# sourceMappingURL=game.js.map