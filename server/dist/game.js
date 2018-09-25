"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = /** @class */ (function () {
    function Game(id) {
        // board dimensions
        this.dimension = 19;
        this.steps = 0;
        this.history = [];
        this.players = [];
        // 1: black; -1: white; 0: empty
        this.turn = 0;
        // freeze the board if inactive
        this.active = false;
        this.id = id;
    }
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=game.js.map