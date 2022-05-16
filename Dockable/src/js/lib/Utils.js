"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
class Utils {
    constructor() {
        this._blocker = document.getElementById("blocker");
    }
    setLoader(isOn) {
        if (isOn) {
            this._blocker.style.display = "block";
        }
        else {
            this._blocker.style.display = "none";
        }
    }
    showAlert(message) {
        var _a;
        var alert = document.createElement("IFRAME");
        alert.setAttribute("src", 'data:text/plain,');
        document.documentElement.appendChild(alert);
        window.frames[0].window.alert(message);
        (_a = alert.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(alert);
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map