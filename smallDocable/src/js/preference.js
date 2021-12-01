"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camera = void 0;
const index_1 = require("./index");
Object.defineProperty(exports, "camera", { enumerable: true, get: function () { return index_1.camera; } });
$(document).ready(function () {
    var _a, _b, _c;
    console.log("DOMContentLoaded");
    (_a = $('#cam_name_input')) === null || _a === void 0 ? void 0 : _a.on('propertychange input', function (e) {
        let element = e.target;
        let filters = [' ', '_', '/'];
        filters.forEach(filter => {
            if (element.value.includes(filter)) {
                element.value = element.value.replace(filter, "");
                index_1.utils.showAlert('The camera name with " ", "_" and "/" is not valid');
            }
        });
    });
    (_c = (_b = $('#preference_modal')) === null || _b === void 0 ? void 0 : _b.find('.close')) === null || _c === void 0 ? void 0 : _c.click(function () {
        loadPreference();
    });
    loadPreference();
    updateUI(false);
});
function loadPreference() {
    console.log("loadPreference()");
}
function updateUI(setEnable) {
    document.querySelectorAll(".form-control").forEach((element) => {
        if (setEnable) {
            $(element).removeClass("disabled");
        }
        else {
            if (element.id === "cam_ip_input")
                return;
            $(element).addClass("disabled");
        }
    });
    let mainControl = $(".main-control");
    let presetButton = $("#assign_preset");
    let ipInput = $("#cam_ip_input");
    if (setEnable) {
        mainControl.removeClass("disabled");
        presetButton.removeClass("disabled");
        ipInput.addClass("disabled");
    }
    else {
        mainControl.addClass("disabled");
        presetButton.addClass("disabled");
        ipInput.removeClass("disabled");
    }
}
//# sourceMappingURL=preference.js.map