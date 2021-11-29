"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.camera = void 0;
const Camera_1 = require("./lib/Camera");
const index_1 = require("./index");
Object.defineProperty(exports, "camera", { enumerable: true, get: function () { return index_1.camera; } });
document.addEventListener('DOMContentLoaded', () => {
    var _a, _b, _c;
    (_a = document.getElementById("cam_name_input")) === null || _a === void 0 ? void 0 : _a.addEventListener('input', (event) => {
        let element = event.target;
        let filters = [' ', '_', '/'];
        filters.forEach(filter => {
            if (element.value.includes(filter)) {
                element.value = element.value.replace(filter, "");
                index_1.utils.showAlert('The camera name with " ", "_" and "/" is not valid');
            }
        });
    });
    (_c = (_b = document.querySelector("#preference_modal")) === null || _b === void 0 ? void 0 : _b.querySelector(".close")) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (event) => {
        loadPreference();
    });
    loadPreference();
    updateUI(false);
});
function loadPreference() {
    index_1.camera.loadConfig();
    if (!index_1.camera.isConnected) {
        document.getElementById("cam_ip_input").value = index_1.camera._config.camera_ip;
    }
    document.getElementById("cam_name").value = index_1.camera._config.camera_name;
    document.getElementById("cam_name_input").value = index_1.camera._config.camera_name;
    document.getElementById("pan_speed").value = String(index_1.camera._config.pan_speed);
    document.getElementById("tilt_speed").value = String(index_1.camera._config.tilt_speed);
    document.getElementById("focus_speed").value = String(index_1.camera._config.focus_speed);
    document.getElementById("zoom_speed").value = String(index_1.camera._config.zoom_speed);
}
function queryCameraConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        index_1.camera._config.mirror = Number(yield index_1.camera.getMirrorStatus());
        index_1.camera._config.flip = Number(yield index_1.camera.getFlipStatus());
        index_1.camera._config.focus_mode = Number(yield index_1.camera.getFocusModeStatus());
        index_1.camera._config.motionless_preset = Number(yield index_1.camera.getMotionlessPresetStatus());
        index_1.camera._config.init_position = Number(yield index_1.camera.getInitPositionStatus());
        index_1.camera._config.camera_name = String(yield index_1.camera.getCameraID());
        updateToggleButton(document.getElementById("mirror_button"), index_1.camera._config.mirror);
        updateToggleButton(document.getElementById("flip_button"), index_1.camera._config.flip);
        updateToggleButton(document.getElementById("focus_mode_button"), index_1.camera._config.focus_mode);
        updateToggleButton(document.getElementById("motionless_preset_button"), index_1.camera._config.motionless_preset);
        document.getElementById("init_position").value = String(index_1.camera._config.init_position);
        document.getElementById("cam_name_input").value = index_1.camera._config.camera_name;
        document.getElementById("cam_name").innerHTML = index_1.camera._config.camera_name;
    });
}
function updateUI(setEnable) {
    document.querySelectorAll(".form-control").forEach((element) => {
        if (setEnable) {
            element.classList.remove("disabled");
        }
        else {
            if (element.id === "cam_ip_input")
                return;
            element.classList.add("disabled");
        }
    });
    let mainControl = document.querySelector(".main-control");
    let presetButton = document.querySelector("#assign_preset");
    let ipInput = document.querySelector("#cam_ip_input");
    if (setEnable) {
        mainControl.classList.remove("disabled");
        presetButton.classList.remove("disabled");
        ipInput.classList.add("disabled");
    }
    else {
        mainControl.classList.add("disabled");
        presetButton.classList.add("disabled");
        ipInput.classList.remove("disabled");
    }
}
function updateToggleButton(target, value) {
    let isToggle = false;
    let controlCommand = null;
    let label = null;
    let newToggleValue = null;
    switch (target.id) {
        case "mirror_button":
            if (value) {
                isToggle = value === Camera_1.MirrorStatus.On;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.MirrorStatus.Off;
                controlCommand = isToggle ? "image_mirror_on" : "image_mirror_off";
                index_1.camera._config.mirror = Number(isToggle);
            }
            label = `Mirror - ${isToggle ? "On" : "Off"}`;
            newToggleValue = isToggle ? String(Camera_1.MirrorStatus.On) : String(Camera_1.MirrorStatus.Off);
            break;
        case "flip_button":
            if (value) {
                isToggle = value === Camera_1.FlipStatus.On;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.FlipStatus.Off;
                controlCommand = isToggle ? "image_flip_on" : "image_flip_off";
                index_1.camera._config.flip = Number(isToggle);
            }
            label = `Flip - ${isToggle ? "On" : "Off"}`;
            newToggleValue = isToggle ? String(Camera_1.FlipStatus.On) : String(Camera_1.FlipStatus.Off);
            break;
        case "motionless_preset_button":
            if (value) {
                isToggle = value === Camera_1.MotionlessPreset.On;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.MotionlessPreset.Off;
                controlCommand = isToggle ? "motionless_preset_on" : "motionless_preset_off";
                index_1.camera._config.motionless_preset = Number(isToggle);
            }
            label = `Motionless Preset - ${isToggle ? "On" : "Off"}`;
            newToggleValue = isToggle ? String(Camera_1.MotionlessPreset.On) : String(Camera_1.MotionlessPreset.Off);
            break;
        case "focus_mode_button":
            if (value) {
                isToggle = value === Camera_1.FocusMode.Manual;
            }
            else {
                isToggle = Number(target.getAttribute("data-toggle-value")) === Camera_1.FocusMode.Auto;
                controlCommand = isToggle ? "focus_mode_manual" : "focus_mode_auto";
                index_1.camera._config.focus_mode = Number(isToggle);
            }
            label = `Focus - ${isToggle ? "Manual" : "Auto"}`;
            newToggleValue = isToggle ? String(Camera_1.FocusMode.Manual) : String(Camera_1.FocusMode.Auto);
            break;
    }
    function updateUI() {
        if (newToggleValue) {
            target.setAttribute("data-toggle-value", newToggleValue);
        }
        if (label) {
            target.innerHTML = label;
        }
    }
    if (controlCommand) {
        let command = controlCommand;
        index_1.camera.sendCommand(Camera_1.LumensCommand[command]).then((data) => {
            updateUI();
        });
    }
    else {
        updateUI();
    }
}
function updateConnectionUI(isConnect) {
    let statusLed = document.getElementById('status_led');
    if (isConnect) {
        statusLed.classList.add("status-on");
        updateUI(true);
    }
    else {
        statusLed.classList.remove("status-on");
        updateUI(false);
    }
}
(_a = document.getElementById('connect_btn')) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let statusLed = document.getElementById('status_led');
    let isConnect = statusLed.classList.contains("status-on");
    index_1.camera.onEventChanged = (event, message) => {
        switch (event) {
            case Camera_1.CameraEvent.notFound:
            case Camera_1.CameraEvent.disconncted:
            case Camera_1.CameraEvent.timeout:
                if (message)
                    index_1.utils.showAlert(message);
                index_1.camera.disconnect();
                updateConnectionUI(false);
                break;
            case Camera_1.CameraEvent.unknown:
                if (message)
                    index_1.utils.showAlert(message);
            default:
                if (message)
                    console.log(message);
                break;
        }
    };
    index_1.utils.setLoader(true);
    if (!isConnect) {
        let ipAddr = (_d = document.getElementById("cam_ip_input")) === null || _d === void 0 ? void 0 : _d.value;
        index_1.camera._config.camera_ip = ipAddr;
        try {
            yield index_1.camera.connect();
            if (index_1.camera.isConnected) {
                yield queryCameraConfig();
                updateConnectionUI(true);
            }
        }
        finally {
            index_1.utils.setLoader(false);
        }
    }
    else {
        index_1.camera.disconnect();
        updateConnectionUI(false);
    }
    index_1.utils.setLoader(false);
}));
document.querySelectorAll('.toggle-button').forEach((item) => {
    item.addEventListener('click', (event) => {
        const target = event.target;
        updateToggleButton(target, null);
    });
});
(_b = document.getElementById('init_position')) === null || _b === void 0 ? void 0 : _b.addEventListener("change", (event) => {
    var _a;
    let initPosition = (_a = event.target) === null || _a === void 0 ? void 0 : _a.value;
    if (initPosition) {
        index_1.camera._config.init_position = Number(initPosition);
        if (index_1.camera._config.init_position === Camera_1.InitPosition.FirstPreset) {
            index_1.camera.sendCommand(Camera_1.LumensCommand.init_position_1st_preset);
        }
        else {
            index_1.camera.sendCommand(Camera_1.LumensCommand.init_position_last_mem);
        }
    }
});
(_c = document.getElementById("pref_save")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j, _k, _l, _m;
    if (!index_1.camera || !index_1.camera.isConnected)
        return;
    index_1.utils.setLoader(true);
    let cameraIp = (_f = (_e = document.getElementById("cam_ip_input")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : "";
    index_1.camera._config.camera_ip = cameraIp;
    let cameraName = (_h = (_g = document.getElementById("cam_name_input")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : "";
    yield index_1.camera.setCameraID(cameraName).then(() => {
        document.getElementById("cam_name").innerHTML = cameraName;
        index_1.camera._config.camera_name = cameraName;
    });
    let panSpeed = (_j = document.getElementById("pan_speed")) === null || _j === void 0 ? void 0 : _j.value;
    if (panSpeed) {
        index_1.camera._config.pan_speed = Number(panSpeed);
    }
    let tiltSpeed = (_k = document.getElementById("tilt_speed")) === null || _k === void 0 ? void 0 : _k.value;
    if (tiltSpeed) {
        index_1.camera._config.tilt_speed = Number(tiltSpeed);
    }
    let zoomSpeed = (_l = document.getElementById("zoom_speed")) === null || _l === void 0 ? void 0 : _l.value;
    if (zoomSpeed) {
        index_1.camera._config.zoom_speed = Number(zoomSpeed);
    }
    let focusSpeed = (_m = document.getElementById("focus_speed")) === null || _m === void 0 ? void 0 : _m.value;
    if (focusSpeed) {
        index_1.camera._config.focus_speed = Number(focusSpeed);
    }
    index_1.camera.saveConfig();
    index_1.utils.setLoader(false);
}));
//# sourceMappingURL=preference.js.map