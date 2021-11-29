import { utils } from "../index"

let debugFlag = 0

const msgInitializeFailed = "Dockable launch failed, please reinstall the OBS Plugin and Dockable Controller."
const msgCameraNotFound = "Failed to connect to the device, please check the network connection and whether the camera has been turned on."
const msgConnectionLost = "The camera has lost connection!"
const msgConnectionTimeout = "Timeout"
const msgCommandInvalid = "Invalid Command"

enum CameraEvent {
  unknown, 
  timeout,
  notFound,
  disconncted,
  connected
}

enum PowerStatus {
  Disconnected = 0,
  On = 2,
  Off = 3
}

enum MirrorStatus {
  On = 2,
  Off = 3
}

enum FlipStatus {
  On = 2,
  Off = 3
}

enum FocusMode {
  Auto = 2,
  Manual = 3
}

enum MotionlessPreset {
  On = 2,
  Off = 3
}

enum InitPosition {
  LastMem = 2,
  FirstPreset = 3
}

enum LumensCommand {
  not_set = '',
  power_on = '01040002',
  power_off = '01040003',
  zoom_stop = '01040700',
  zoom_tele_standard = '01040702',
  zoom_wide_standard = '01040703',
  zoom_tele_step = '01040704',
  zoom_wide_step = '01040705',
  zoom_tele_variable = '0104072',
  zoom_wide_variable = '0104073',
  focus_stop = '01040800',
  focus_far_standard = '01040802',
  focus_near_standard = '01040803',
  focus_far_step = '01040804',
  focus_near_step = '01040805',
  focus_far_variable = '0104082',
  focus_near_variable = '0104083',
  pan_tilt_home = '010604',
  pan_tilt_up = '0301',
  pan_tilt_down = '0302',
  pan_tilt_left = '0103',
  pan_tilt_right = '0203',
  pan_tilt_stop = '0303',
  preset_set = '01043F01',
  preset_recall = '01043F02',
  image_mirror_on = '01046102',
  image_mirror_off = '01046103',
  image_flip_on = '01046602',
  image_flip_off = '01046603',
  focus_mode_auto = '01043802',
  focus_mode_manual = '01043803',
  motionless_preset_on = '01070102',
  motionless_preset_off = '01070103',
  init_position_last_mem = '0104756A00',
  init_position_1st_preset = '0104756A01',
  cam_name = '01CE'
}

enum LumensInquiryCommand {
  not_set = '',
  inq_power_status = '090400',
  inq_system_status = '09040001',
  inq_mirror = '090461',
  inq_flip = '090466',
  inq_focus_mode = '090438',
  inq_motionless_preset = '090701',
  inq_init_position = '0904756A',
  inq_cam_name = '097ECE'
}

interface ICameraControl {
  sendCommand(command: LumensCommand, value?: Buffer): void
  sendInqCommand(command: LumensInquiryCommand): void
}

class Camera implements ICameraControl {
  defulatConfig = {
    camera_ip: '192.168.100.100',
    camera_addr: 1,
    camera_name: 'Camera01',
    mirror: 0,
    flip: 0,
    motionless_preset: 0,
    focus_mode: FocusMode.Auto,
    pan_speed: 8,
    tilt_speed: 8,
    zoom_speed: 5,
    focus_speed: 5,
    init_position: InitPosition.FirstPreset,
    preset: 0
  }

  public onEventChanged?: (event: CameraEvent, message: string | undefined) => void

  private _socket?: WebSocket
  private _payloadSequence = 0
  private _connected = false
  private _commandTimer: any

  _config = this.defulatConfig

  constructor(host: string | undefined = undefined) {
    if (host) {
      this._config.camera_ip = host
    }
  }

  get payloadSequence() {
    return this._payloadSequence++
  }

  get isConnected() {
    return this._connected
  }

  private async getViscaSocket() {
    return new Promise<WebSocket>((resolve, reject) => {
      if (!this._socket || this._socket.readyState !== 1) {
        this.connectWebSocket().then((socket) => {
          this._socket = socket
          resolve(this._socket)
        }).catch((error) => {
          reject(error)
        })
      } else {
        resolve(this._socket)
      }
    })
  }

  private async connectWebSocket() {
    return new Promise<WebSocket>((resolve, reject) => {
      let webSocket = new WebSocket("ws://localhost:55260")

      webSocket.onopen = (event) => {
        resolve(webSocket)
      }

      webSocket.onclose = (event) => {
        reject(msgInitializeFailed)
      }
    })
  }

  private async sendMessageToProxy(socket: WebSocket, buffer: Buffer, inquiry: Boolean) {
    return new Promise<string>((resolve, reject) => {
      if (!socket || socket.readyState != 1) {
        reject(msgConnectionLost)
        return
      }

      clearTimeout(this._commandTimer)

      if (inquiry) {
        this._commandTimer = setTimeout(() => {
          reject()
        }, 5000)
      }

      socket.send(JSON.stringify({
        ip: this._config.camera_ip,
        port: 52381,
        data: buffer.toJSON().data
      }))

      socket.onmessage = (event) => {
        clearTimeout(this._commandTimer)
        resolve(event.data)
      }

      socket.onerror = (err) => {
        clearTimeout(this._commandTimer)
        reject(err)
      }
    })
  }

  private getDataBuffer(command: any | LumensCommand | LumensInquiryCommand, value?: Buffer): Buffer | undefined {
    if (!command) return undefined

    let payloadType;

    if (Object.values(LumensCommand).includes(command)) {
      payloadType = '0100'
    } else if (Object.values(LumensInquiryCommand).includes(command)) {
      payloadType = '0110'
    } else {
      return undefined
    }

    let payload = `8${this._config.camera_addr}`

    switch (command) {
      case LumensCommand.zoom_tele_variable:
      case LumensCommand.zoom_wide_variable:
        payload += `${command}${this._config.zoom_speed}`
        break

      case LumensCommand.focus_near_variable:
      case LumensCommand.focus_far_variable:
        payload += `${command}${this._config.focus_speed}`
        break

      case LumensCommand.pan_tilt_stop:
      case LumensCommand.pan_tilt_up:
      case LumensCommand.pan_tilt_down:
      case LumensCommand.pan_tilt_left:
      case LumensCommand.pan_tilt_right:
        payload += `010601${this._config.pan_speed.toString().padStart(2, '0')}${this._config.tilt_speed.toString().padStart(2, '0')}${command}`
        break

      case LumensCommand.preset_set:
      case LumensCommand.preset_recall:
        payload += `${command}${this._config.preset.toString().padStart(2, '0')}`
        break

      case LumensCommand.cam_name:
        payload += `${command}${value?.toString('hex').padEnd(24, '0')}`
        break

      default:
        payload += command
    }

    payload += 'FF'

    let data = `${payloadType}${(payload.length / 2).toString(16).padStart(4, '0')}${this.payloadSequence.toString().padStart(8, '0')}${payload}`

    let buffer = Buffer.from(data, 'hex')

    return buffer
  }

  private parseInquiryResult(data: Buffer): Buffer | null {
    let headerOffset = 8

    var cameraAddr = this._config.camera_addr + 8

    if (data[headerOffset] >> 4 !== cameraAddr) return null
    if (data[headerOffset + 1] >> 4 !== 5) return null

    return data.slice(headerOffset + 2, data.length - 1)
  }

  private commandTimeout() {
    if (this.onEventChanged) {
      if (this._connected) {
        this.onEventChanged(CameraEvent.timeout, msgConnectionLost)
      } else {
        this.onEventChanged(CameraEvent.notFound, msgCameraNotFound)
      }
    }

    utils.setLoader(false)
  }

  /**
   * Public function
   */
  async connect() {
    let powerStatus = await this.getPowerStatus()

    // if (powerStatus === PowerStatus.Off) {
    //   this.powerOn()
    //   powerStatus = await this.getPowerStatus()
    // }

    this._connected = powerStatus === PowerStatus.On

    if (this.onEventChanged) {
      if (this._connected) {
        this.onEventChanged(CameraEvent.connected, undefined)
      } else { 
        this.onEventChanged(CameraEvent.notFound, msgCameraNotFound) 
      }
    }
  }

  async disconnect() {
    if (this._socket) {
      await this._socket.close()
    }

    this._connected = false
  }

  async getPowerStatus() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_power_status)
    let result = data ? data[0] as PowerStatus : PowerStatus.Off
    return result
  }

  async getSystemStatus() {
    let result = await this.sendInqCommand(LumensInquiryCommand.inq_system_status)
    return true
  }

  async getMirrorStatus() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_mirror)
    let result = data ? data[0] as MirrorStatus : MirrorStatus.Off
    return result
  }

  async getFlipStatus() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_flip)
    let result = data ? data[0] as FlipStatus : FlipStatus.Off
    return result
  }

  async getFocusModeStatus() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_focus_mode)
    let result = data ? data[0] as FocusMode : FocusMode.Auto
    return result
  }

  async getMotionlessPresetStatus() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_motionless_preset)
    let result = data ? data[0] as MotionlessPreset : MotionlessPreset.Off
    return result
  }

  async getInitPositionStatus() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_init_position)
    let result = data ? data[0] as InitPosition : InitPosition.LastMem
    return result
  }

  async getCameraID() {
    let data = await this.sendInqCommand(LumensInquiryCommand.inq_cam_name)

    var output = ''
    data && data.forEach(byte => {
      if (byte !== 0) {
        output += String.fromCharCode(byte)
      }
    });

    return output
  }

  async setCameraID(cameraName: String) {
    var cameraNameCommand = Buffer.from(cameraName)
    let data = await this.sendCommand(LumensCommand.cam_name, cameraNameCommand)
  }

  powerOff() {
    this.sendCommand(LumensCommand.power_off)
  }

  powerOn() {
    this.sendCommand(LumensCommand.power_on)
  }

  loadConfig() {
    let config = localStorage.getItem('config')

    if (config) {
      let parsedConfig = JSON.parse(config)
      this._config.camera_ip = parsedConfig['camera_ip']
      this._config.camera_addr = parsedConfig['camera_addr'],
      this._config.pan_speed = parsedConfig['pan_speed'],
      this._config.tilt_speed = parsedConfig['tilt_speed'],
      this._config.zoom_speed = parsedConfig['zoom_speed'],
      this._config.focus_speed = parsedConfig['focus_speed']
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
    }

    localStorage.setItem('config', JSON.stringify(configToSave))
  }

  /**
   * ICameraControl
   */

  sendCommand(command: LumensCommand, value?: Buffer) {
    return new Promise<Uint8Array>(async (resolve, reject) => {
      if (!this._connected && command !== LumensCommand.power_on) {
        if (this.onEventChanged) this.onEventChanged(CameraEvent.notFound, msgCameraNotFound)
        reject(msgCameraNotFound)
        return
      }

      let buffer = this.getDataBuffer(command, value)
      if (!buffer) {
        if (this.onEventChanged) this.onEventChanged(CameraEvent.unknown, msgCameraNotFound)
        reject(msgCommandInvalid)
        return
      }

      if (debugFlag) console.log(`Send command: ${buffer.toString('hex')}`);

      this.getViscaSocket().then(socket => {
        this.sendMessageToProxy(socket, buffer!, true).then((result) => {
          let jsonData = JSON.parse(result)
          let data = jsonData['data']

          let dataBuffer = Buffer.from(data)
          if (debugFlag) console.log(`Receive data: ${dataBuffer.toString('hex')}`)

          resolve(dataBuffer)
        }).catch((err) => {
          this.commandTimeout()
          reject(err)
        })
      }).catch((err) => {
        if (this.onEventChanged) this.onEventChanged(CameraEvent.unknown, err)
        reject(err)
      })
    })
  }

  sendInqCommand(command: LumensInquiryCommand) {
    return new Promise<Buffer | null>(async (resolve, reject) => {
      let buffer = this.getDataBuffer(command)
      if (!buffer) {
        reject(msgCommandInvalid)
        return
      }

      if (debugFlag) console.log(`Send command: ${buffer.toString('hex')}`);

      this.getViscaSocket().then(socket => {
        this.sendMessageToProxy(socket, buffer!, true).then((result) => {
          let jsonData = JSON.parse(result)
          let data = jsonData['data']

          let dataBuffer = Buffer.from(data)
          if (debugFlag) console.log(`Receive data: ${dataBuffer.toString('hex')}`)
          
          var parsedResult = this.parseInquiryResult(data)
          resolve(parsedResult)
        }).catch((err) => {
          this.commandTimeout()
          reject(err)
        })
      }).catch((err) => {
        if (this.onEventChanged) this.onEventChanged(CameraEvent.unknown, msgInitializeFailed)
        reject(err)
      })
    })
  }
}

export { Camera, CameraEvent, LumensCommand, PowerStatus, MirrorStatus, FlipStatus, FocusMode, MotionlessPreset, InitPosition }