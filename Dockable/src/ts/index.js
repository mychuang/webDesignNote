"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.camera = void 0;
const Camera_1 = require("./lib/Camera");
const Utils_1 = require("./lib/Utils");
let camera = new Camera_1.Camera();
exports.camera = camera;
let utils = new Utils_1.Utils();
exports.utils = utils;
function handleTwoActionCameraCommand(command, stop) {
    if (!command || !camera)
        return;
    if (stop) {
        switch (command) {
            case Camera_1.LumensCommand.zoom_tele_standard:
            case Camera_1.LumensCommand.zoom_wide_standard:
            case Camera_1.LumensCommand.zoom_tele_variable:
            case Camera_1.LumensCommand.zoom_wide_variable:
                command = Camera_1.LumensCommand.zoom_stop;
                break;
            case Camera_1.LumensCommand.focus_near_standard:
            case Camera_1.LumensCommand.focus_far_standard:
            case Camera_1.LumensCommand.focus_near_variable:
            case Camera_1.LumensCommand.focus_far_variable:
                command = Camera_1.LumensCommand.focus_stop;
                break;
            case Camera_1.LumensCommand.pan_tilt_up:
            case Camera_1.LumensCommand.pan_tilt_down:
            case Camera_1.LumensCommand.pan_tilt_left:
            case Camera_1.LumensCommand.pan_tilt_right:
                command = Camera_1.LumensCommand.pan_tilt_stop;
                break;
        }
    }
    camera.sendCommand(command);
}
document.querySelectorAll(".camera-control").forEach((element) => {
    element.addEventListener("mousedown", (event) => {
        const target = event.target;
        let commandStr = target.getAttribute("data-control");
        if (!commandStr)
            return;
        let command = Camera_1.LumensCommand[commandStr];
        if (target.classList.contains("two-action-btn")) {
            handleTwoActionCameraCommand(command, false);
            // For the sake of received event when mouse cursor is dragged outside of element, you have to register global event 
            document.addEventListener("mouseup", (event) => {
                handleTwoActionCameraCommand(command, true);
            }, { once: true });
        }
        else {
            camera.sendCommand(command);
        }
    });
    element.addEventListener("click", (event) => {
        event.preventDefault();
    });
});
