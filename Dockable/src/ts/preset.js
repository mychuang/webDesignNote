"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camera = void 0;
const Camera_1 = require("./lib/Camera");
const preference_1 = require("./preference");
Object.defineProperty(exports, "camera", { enumerable: true, get: function () { return preference_1.camera; } });
const index_1 = require("./index");
let churchImages = [
    "Podium",
    "Podium Zoom",
    "2nd Podium",
    "Credence Table",
    "Credence Table Zoom",
    "Stage",
    "Church Pews",
    "Choir",
    "Church Band"
];
document.querySelectorAll(".preset-item").forEach((item) => {
    item.addEventListener("click", (event) => {
        if (!preference_1.camera)
            return;
        index_1.utils.setLoader(true);
        let target = event.target;
        let presetNum = target.getAttribute("data-preset");
        preference_1.camera._config.preset = Number(presetNum);
        preference_1.camera.sendCommand(Camera_1.LumensCommand.preset_set).then(() => {
            setTimeout(() => {
                index_1.utils.setLoader(false);
            }, 800);
        }).catch((err) => {
            var _a;
            let closeButton = (_a = document.querySelector("#preset_modal")) === null || _a === void 0 ? void 0 : _a.querySelector(".close");
            if (closeButton)
                closeButton.click();
        });
    });
});
document.querySelectorAll(".preset-recall-item").forEach((item) => {
    item.addEventListener("click", (event) => {
        if (!preference_1.camera)
            return;
        let target = event.target;
        let presetNum = target.getAttribute("data-preset");
        preference_1.camera._config.preset = Number(presetNum);
        preference_1.camera.sendCommand(Camera_1.LumensCommand.preset_recall);
    });
});
