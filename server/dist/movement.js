"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Movement = /** @class */ (function () {
    function Movement(add, remove, turn) {
        if (add === void 0) { add = []; }
        if (remove === void 0) { remove = []; }
        if (turn === void 0) { turn = null; }
        this.add = [];
        this.remove = [];
        this.add = add;
        this.remove = remove;
        this.turn = turn;
    }
    return Movement;
}());
exports.Movement = Movement;
//# sourceMappingURL=movement.js.map