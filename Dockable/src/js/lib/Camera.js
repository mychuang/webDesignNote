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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitPosition = exports.MotionlessPreset = exports.FocusMode = exports.FlipStatus = exports.MirrorStatus = exports.PowerStatus = exports.LumensCommand = exports.CameraEvent = exports.Camera = void 0;
const index_1 = require("../index");
let debugFlag = 0;
const msgInitializeFailed = "Dockable launch failed, please reinstall the OBS Plugin and Dockable Controller.";
const msgCameraNotFound = "Failed to connect to the device, please check the network connection and whether the camera has been turned on.";
const msgConnectionLost = "The camera has lost connection!";
const msgConnectionTimeout = "Timeout";
const msgCommandInvalid = "Invalid Command";
var CameraEvent;
(function (CameraEvent) {
    CameraEvent[CameraEvent["unknown"] = 0] = "unknown";
    CameraEvent[CameraEvent["timeout"] = 1] = "timeout";
    CameraEvent[CameraEvent["notFound"] = 2] = "notFound";
    CameraEvent[CameraEvent["disconncted"] = 3] = "disconncted";
    CameraEvent[CameraEvent["connected"] = 4] = "connected";
})(CameraEvent || (CameraEvent = {}));
exports.CameraEvent = CameraEvent;
var PowerStatus;
(function (PowerStatus) {
    PowerStatus[PowerStatus["Disconnected"] = 0] = "Disconnected";
    PowerStatus[PowerStatus["On"] = 2] = "On";
    PowerStatus[PowerStatus["Off"] = 3] = "Off";
})(PowerStatus || (PowerStatus = {}));
exports.PowerStatus = PowerStatus;
var MirrorStatus;
(function (MirrorStatus) {
    MirrorStatus[MirrorStatus["On"] = 2] = "On";
    MirrorStatus[MirrorStatus["Off"] = 3] = "Off";
})(MirrorStatus || (MirrorStatus = {}));
exports.MirrorStatus = MirrorStatus;
var FlipStatus;
(function (FlipStatus) {
    FlipStatus[FlipStatus["On"] = 2] = "On";
    FlipStatus[FlipStatus["Off"] = 3] = "Off";
})(FlipStatus || (FlipStatus = {}));
exports.FlipStatus = FlipStatus;
var FocusMode;
(function (FocusMode) {
    FocusMode[FocusMode["Auto"] = 2] = "Auto";
    FocusMode[FocusMode["Manual"] = 3] = "Manual";
})(FocusMode || (FocusMode = {}));
exports.FocusMode = FocusMode;
var MotionlessPreset;
(function (MotionlessPreset) {
    MotionlessPreset[MotionlessPreset["On"] = 2] = "On";
    MotionlessPreset[MotionlessPreset["Off"] = 3] = "Off";
})(MotionlessPreset || (MotionlessPreset = {}));
exports.MotionlessPreset = MotionlessPreset;
var InitPosition;
(function (InitPosition) {
    InitPosition[InitPosition["LastMem"] = 3] = "LastMem";
    InitPosition[InitPosition["FirstPreset"] = 2] = "FirstPreset";
    InitPosition[InitPosition["LastMemOn"] = 4] = "LastMemOn";
    InitPosition[InitPosition["LastMemOff"] = 5] = "LastMemOff";
    InitPosition[InitPosition["unknown"] = 99] = "unknown";
})(InitPosition || (InitPosition = {}));
exports.InitPosition = InitPosition;
var LumensCommand;
(function (LumensCommand) {
    LumensCommand["not_set"] = "";
    LumensCommand["power_on"] = "01040002";
    LumensCommand["power_off"] = "01040003";
    LumensCommand["zoom_stop"] = "01040700";
    LumensCommand["zoom_tele_standard"] = "01040702";
    LumensCommand["zoom_wide_standard"] = "01040703";
    LumensCommand["zoom_tele_step"] = "01040704";
    LumensCommand["zoom_wide_step"] = "01040705";
    LumensCommand["zoom_tele_variable"] = "0104072";
    LumensCommand["zoom_wide_variable"] = "0104073";
    LumensCommand["focus_stop"] = "01040800";
    LumensCommand["focus_far_standard"] = "01040802";
    LumensCommand["focus_near_standard"] = "01040803";
    LumensCommand["focus_far_step"] = "01040804";
    LumensCommand["focus_near_step"] = "01040805";
    LumensCommand["focus_far_variable"] = "0104082";
    LumensCommand["focus_near_variable"] = "0104083";
    LumensCommand["pan_tilt_home"] = "010604";
    LumensCommand["pan_tilt_up"] = "0301";
    LumensCommand["pan_tilt_down"] = "0302";
    LumensCommand["pan_tilt_left"] = "0103";
    LumensCommand["pan_tilt_right"] = "0203";
    LumensCommand["pan_tilt_stop"] = "0303";
    LumensCommand["preset_set"] = "01043F01";
    LumensCommand["preset_recall"] = "01043F02";
    LumensCommand["image_mirror_on"] = "01046102";
    LumensCommand["image_mirror_off"] = "01046103";
    LumensCommand["image_flip_on"] = "01046602";
    LumensCommand["image_flip_off"] = "01046603";
    LumensCommand["focus_mode_auto"] = "01043802";
    LumensCommand["focus_mode_manual"] = "01043803";
    LumensCommand["motionless_preset_on"] = "01070102";
    LumensCommand["motionless_preset_off"] = "01070103";
    LumensCommand["init_position_last_mem"] = "0104756A03";
    LumensCommand["init_position_1st_preset"] = "0104756A02";
    LumensCommand["init_position_last_mem_on"] = "01043F0100";
    LumensCommand["init_position_1ast_mem_off"] = "01043F0000";
    LumensCommand["cam_name"] = "01CE";
})(LumensCommand || (LumensCommand = {}));
exports.LumensCommand = LumensCommand;
var LumensInquiryCommand;
(function (LumensInquiryCommand) {
    LumensInquiryCommand["not_set"] = "";
    LumensInquiryCommand["inq_power_status"] = "090400";
    LumensInquiryCommand["inq_system_status"] = "09040001";
    LumensInquiryCommand["inq_mirror"] = "090461";
    LumensInquiryCommand["inq_flip"] = "090466";
    LumensInquiryCommand["inq_focus_mode"] = "090438";
    LumensInquiryCommand["inq_motionless_preset"] = "090701";
    LumensInquiryCommand["inq_init_position"] = "0904756A";
    LumensInquiryCommand["inq_cam_name"] = "097ECE";
    LumensInquiryCommand["inq_CV605"] = "090002";
})(LumensInquiryCommand || (LumensInquiryCommand = {}));
class Camera {
    constructor(host = undefined) {
        this.defulatConfig = {
            camera_ip: '192.168.100.100',
            camera_addr: 1,
            camera_name: 'Camera 01',
            mirror: 0,
            flip: 0,
            motionless_preset: 0,
            focus_mode: FocusMode.Auto,
            pan_speed: 8,
            tilt_speed: 8,
            zoom_speed: 5,
            focus_speed: 5,
            init_position: InitPosition.unknown,
            preset: 0,
            CV605: 0
        };
        this._payloadSequence = 0;
        this._connected = false;
        this._config = this.defulatConfig;
        if (host) {
            this._config.camera_ip = host;
        }
    }
    get payloadSequence() {
        return this._payloadSequence++;
    }
    get isConnected() {
        return this._connected;
    }
    getViscaSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this._socket || this._socket.readyState !== 1) {
                    this.connectWebSocket().then((socket) => {
                        this._socket = socket;
                        resolve(this._socket);
                    }).catch((error) => {
                        reject(error);
                    });
                }
                else {
                    resolve(this._socket);
                }
            });
        });
    }
    connectWebSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let webSocket = new WebSocket("ws://localhost:55260");
                webSocket.onopen = (event) => {
                    resolve(webSocket);
                };
                webSocket.onclose = (event) => {
                    reject(msgInitializeFailed);
                };
            });
        });
    }
    sendMessageToProxy(socket, buffer, inquiry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!socket || socket.readyState != 1) {
                    reject(msgConnectionLost);
                    return;
                }
                clearTimeout(this._commandTimer);
                if (inquiry) {
                    this._commandTimer = setTimeout(() => {
                        reject();
                    }, 5000);
                }
                socket.send(JSON.stringify({
                    ip: this._config.camera_ip,
                    port: 52381,
                    data: buffer.toJSON().data
                }));
                socket.onmessage = (event) => {
                    clearTimeout(this._commandTimer);
                    resolve(event.data);
                };
                socket.onerror = (err) => {
                    clearTimeout(this._commandTimer);
                    reject(err);
                };
            });
        });
    }
    getDataBuffer(command, value) {
        if (!command)
            return undefined;
        let payloadType;
        if (Object.values(LumensCommand).includes(command)) {
            payloadType = '0100';
        }
        else if (Object.values(LumensInquiryCommand).includes(command)) {
            payloadType = '0110';
        }
        else {
            return undefined;
        }
        let payload = `8${this._config.camera_addr}`;
        switch (command) {
            case LumensCommand.zoom_tele_variable:
            case LumensCommand.zoom_wide_variable:
                payload += `${command}${this._config.zoom_speed}`;
                break;
            case LumensCommand.focus_near_variable:
            case LumensCommand.focus_far_variable:
                payload += `${command}${this._config.focus_speed}`;
                break;
            case LumensCommand.pan_tilt_stop:
            case LumensCommand.pan_tilt_up:
            case LumensCommand.pan_tilt_down:
            case LumensCommand.pan_tilt_left:
            case LumensCommand.pan_tilt_right:
                payload += `010601${this._config.pan_speed.toString(16).padStart(2, '0')}${this._config.tilt_speed.toString(16).padStart(2, '0')}${command}`;
                break;
            case LumensCommand.preset_set:
            case LumensCommand.preset_recall:
                payload += `${command}${this._config.preset.toString(16).padStart(2, '0')}`;
                break;
            case LumensCommand.cam_name:
                payload += `${command}${value === null || value === void 0 ? void 0 : value.toString('hex').padEnd(24, '0')}`;
                break;
            default:
                payload += command;
        }
        payload += 'FF';
        let data = `${payloadType}${(payload.length / 2).toString(16).padStart(4, '0')}${this.payloadSequence.toString(16).padStart(8, '0')}${payload}`;
        let buffer = Buffer.from(data, 'hex');
        return buffer;
    }
    parseInquiryResult(data) {
        let headerOffset = 8;
        var cameraAddr = this._config.camera_addr + 8;
        if (data[headerOffset] >> 4 !== cameraAddr)
            return null;
        if (data[headerOffset + 1] >> 4 !== 5)
            return null;
        return data.slice(headerOffset + 2, data.length - 1);
    }
    commandTimeout() {
        if (this.onEventChanged) {
            if (this._connected) {
                this.onEventChanged(CameraEvent.timeout, msgConnectionLost);
            }
            else {
                this.onEventChanged(CameraEvent.notFound, msgCameraNotFound);
            }
        }
        index_1.utils.setLoader(false);
    }
    /**
     * Public function
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            let powerStatus = yield this.getPowerStatus();
            // if (powerStatus === PowerStatus.Off) {
            //   this.powerOn()
            //   powerStatus = await this.getPowerStatus()
            // }
            this._connected = powerStatus === PowerStatus.On;
            if (this.onEventChanged) {
                if (this._connected) {
                    this.onEventChanged(CameraEvent.connected, undefined);
                }
                else {
                    this.onEventChanged(CameraEvent.notFound, msgCameraNotFound);
                }
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._socket) {
                yield this._socket.close();
            }
            this._connected = false;
        });
    }
    getPowerStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_power_status);
            let result = data ? data[0] : PowerStatus.Off;
            return result;
        });
    }
    getSystemStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.sendInqCommand(LumensInquiryCommand.inq_system_status);
            return true;
        });
    }
    getMirrorStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_mirror);
            let result = data ? data[0] : MirrorStatus.Off;
            return result;
        });
    }
    getFlipStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_flip);
            let result = data ? data[0] : FlipStatus.Off;
            return result;
        });
    }
    getFocusModeStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_focus_mode);
            let result = data ? data[0] : FocusMode.Auto;
            return result;
        });
    }
    getMotionlessPresetStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_motionless_preset);
            let result = data ? data[0] : MotionlessPreset.Off;
            return result;
        });
    }
    getCV605() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_CV605);
            var output = '';
            data && data.forEach(byte => {
                if (byte !== 0) {
                    output += byte.toString(16);
                }
            });
            if (output[3] == '5' && output[4] == '4' && output[5] == '3') {
                return 1;
            }
            else if (output[3] == '6' && output[4] == '1' && output[5] == '0') {
                return 1;
            }
            else {
                return 0;
            }
        });
    }
    getInitPositionStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_init_position);
            let result = data ? data[0] : InitPosition.LastMem;
            return result;
        });
    }
    getCameraID() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.sendInqCommand(LumensInquiryCommand.inq_cam_name);
            var output = '';
            data && data.forEach(byte => {
                if (byte !== 0) {
                    output += String.fromCharCode(byte);
                }
            });
            return output;
        });
    }
    setCameraID(cameraName) {
        return __awaiter(this, void 0, void 0, function* () {
            var cameraNameCommand = Buffer.from(cameraName);
            let data = yield this.sendCommand(LumensCommand.cam_name, cameraNameCommand);
        });
    }
    powerOff() {
        this.sendCommand(LumensCommand.power_off);
    }
    powerOn() {
        this.sendCommand(LumensCommand.power_on);
    }
    loadConfig() {
        let config = localStorage.getItem('config');
        if (config) {
            let parsedConfig = JSON.parse(config);
            this._config.camera_ip = parsedConfig['camera_ip'];
            this._config.camera_addr = parsedConfig['camera_addr'],
                this._config.pan_speed = parsedConfig['pan_speed'],
                this._config.tilt_speed = parsedConfig['tilt_speed'],
                this._config.zoom_speed = parsedConfig['zoom_speed'],
                this._config.focus_speed = parsedConfig['focus_speed'];
        }
    }
    saveConfig() {
        let configToSave = {
            camera_ip: this._config.camera_ip,
            camera_addr: this._config.camera_addr,
            pan_speed: this._config.pan_speed,
            tilt_speed: this._config.tilt_speed,
            zoom_speed: this._config.zoom_speed,
            focus_speed: this._config.focus_speed
        };
        localStorage.setItem('config', JSON.stringify(configToSave));
    }
    /**
     * ICameraControl
     */
    sendCommand(command, value) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!this._connected && command !== LumensCommand.power_on) {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.notFound, msgCameraNotFound);
                reject(msgCameraNotFound);
                return;
            }
            let buffer = this.getDataBuffer(command, value);
            if (!buffer) {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.unknown, msgCameraNotFound);
                reject(msgCommandInvalid);
                return;
            }
            if (debugFlag)
                console.log(`Send command: ${buffer.toString('hex')}`);
            this.getViscaSocket().then(socket => {
                this.sendMessageToProxy(socket, buffer, true).then((result) => {
                    let jsonData = JSON.parse(result);
                    let data = jsonData['data'];
                    let dataBuffer = Buffer.from(data);
                    if (debugFlag)
                        console.log(`Receive data: ${dataBuffer.toString('hex')}`);
                    resolve(dataBuffer);
                }).catch((err) => {
                    this.commandTimeout();
                    reject(err);
                });
            }).catch((err) => {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.unknown, err);
                reject(err);
            });
        }));
    }
    sendInqCommand(command) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let buffer = this.getDataBuffer(command);
            if (!buffer) {
                reject(msgCommandInvalid);
                return;
            }
            if (debugFlag)
                console.log(`Send command: ${buffer.toString('hex')}`);
            this.getViscaSocket().then(socket => {
                this.sendMessageToProxy(socket, buffer, true).then((result) => {
                    let jsonData = JSON.parse(result);
                    let data = jsonData['data'];
                    let dataBuffer = Buffer.from(data);
                    if (debugFlag)
                        console.log(`Receive data: ${dataBuffer.toString('hex')}`);
                    var parsedResult = this.parseInquiryResult(data);
                    resolve(parsedResult);
                }).catch((err) => {
                    this.commandTimeout();
                    reject(err);
                });
            }).catch((err) => {
                if (this.onEventChanged)
                    this.onEventChanged(CameraEvent.unknown, msgInitializeFailed);
                reject(err);
            });
        }));
    }
}
exports.Camera = Camera;
//# sourceMappingURL=Camera.js.map