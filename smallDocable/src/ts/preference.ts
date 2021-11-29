import { CameraEvent, LumensCommand, MirrorStatus, FlipStatus, FocusMode, MotionlessPreset, InitPosition } from "./lib/Camera";
import { camera, utils } from "./index"

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("cam_name_input")?.addEventListener('input', (event) => {
    let element = <HTMLInputElement>event.target

    let filters = [' ', '_', '/']
    filters.forEach(filter => {
      if (element.value.includes(filter)) {
        element.value = element.value.replace(filter, "")
        utils.showAlert('The camera name with " ", "_" and "/" is not valid')
      }
    });
  })

  document.querySelector("#preference_modal")?.querySelector(".close")?.addEventListener('click', (event) => {
    loadPreference()
  })

  loadPreference()
  updateUI(false)
})

function loadPreference() {
  camera.loadConfig();

  if (!camera.isConnected) {
    (<HTMLInputElement>document.getElementById("cam_ip_input")).value = camera._config.camera_ip;
  }

  (<HTMLInputElement>document.getElementById("cam_name")).value = camera._config.camera_name;
  (<HTMLInputElement>document.getElementById("cam_name_input")).value = camera._config.camera_name;

  (<HTMLSelectElement>document.getElementById("pan_speed")).value = String(camera._config.pan_speed);
  (<HTMLSelectElement>document.getElementById("tilt_speed")).value = String(camera._config.tilt_speed);
  (<HTMLSelectElement>document.getElementById("focus_speed")).value = String(camera._config.focus_speed);
  (<HTMLSelectElement>document.getElementById("zoom_speed")).value = String(camera._config.zoom_speed);
}

async function queryCameraConfig() {
  camera._config.mirror = Number(await camera.getMirrorStatus() )
  camera._config.flip = Number(await camera.getFlipStatus())
  camera._config.focus_mode = Number(await camera.getFocusModeStatus())
  camera._config.motionless_preset = Number(await camera.getMotionlessPresetStatus())
  camera._config.init_position = Number(await camera.getInitPositionStatus())
  camera._config.camera_name = String(await camera.getCameraID())

  updateToggleButton(<Element>document.getElementById("mirror_button"), camera._config.mirror);
  updateToggleButton(<Element>document.getElementById("flip_button"), camera._config.flip);
  updateToggleButton(<Element>document.getElementById("focus_mode_button"), camera._config.focus_mode);
  updateToggleButton(<Element>document.getElementById("motionless_preset_button"), camera._config.motionless_preset);

  (<HTMLSelectElement>document.getElementById("init_position")).value = String(camera._config.init_position);
  (<HTMLInputElement>document.getElementById("cam_name_input")).value = camera._config.camera_name;
  (<HTMLInputElement>document.getElementById("cam_name")).innerHTML = camera._config.camera_name;
}

function updateUI(setEnable: boolean) {
  document.querySelectorAll(".form-control").forEach((element) => {
    if (setEnable) {
      element.classList.remove("disabled")
    } else {
      if (element.id === "cam_ip_input") return
      element.classList.add("disabled")
    }
  })

  let mainControl = <HTMLElement>document.querySelector(".main-control")
  let presetButton = <HTMLElement>document.querySelector("#assign_preset")
  let ipInput = <HTMLElement>document.querySelector("#cam_ip_input")

  if (setEnable) {
    mainControl.classList.remove("disabled")
    presetButton.classList.remove("disabled")
    ipInput.classList.add("disabled")
  } else {
    mainControl.classList.add("disabled")
    presetButton.classList.add("disabled")
    ipInput.classList.remove("disabled")
  }
}

function updateToggleButton(target: Element, value: String | Number | null) {
  let isToggle = false
  let controlCommand = null
  let label: string | null = null
  let newToggleValue: string | null = null

  switch (target.id) {
    case "mirror_button":
      if (value) {
        isToggle = value === MirrorStatus.On
      } else {
        isToggle = Number(target.getAttribute("data-toggle-value")) === MirrorStatus.Off
        controlCommand = isToggle ? "image_mirror_on" : "image_mirror_off"
        camera._config.mirror = Number(isToggle)
      }

      label = `Mirror - ${isToggle ? "On" : "Off"}`
      newToggleValue = isToggle ? String(MirrorStatus.On) : String(MirrorStatus.Off)
      break;

    case "flip_button":
      if (value) {
        isToggle = value === FlipStatus.On
      } else {
        isToggle = Number(target.getAttribute("data-toggle-value")) === FlipStatus.Off
        controlCommand = isToggle ? "image_flip_on" : "image_flip_off"
        camera._config.flip = Number(isToggle)
      }

      label = `Flip - ${isToggle ? "On" : "Off"}`
      newToggleValue = isToggle ? String(FlipStatus.On) : String(FlipStatus.Off)
      break;

    case "motionless_preset_button":
      if (value) {
        isToggle = value === MotionlessPreset.On
      } else {
        isToggle = Number(target.getAttribute("data-toggle-value")) === MotionlessPreset.Off
        controlCommand = isToggle ? "motionless_preset_on" : "motionless_preset_off"
        camera._config.motionless_preset = Number(isToggle)
      }

      label = `Motionless Preset - ${isToggle ? "On" : "Off"}`
      newToggleValue = isToggle ? String(MotionlessPreset.On) : String(MotionlessPreset.Off)
      break;

    case "focus_mode_button":
      if (value) {
        isToggle = value === FocusMode.Manual
      } else {
        isToggle = Number(target.getAttribute("data-toggle-value")) === FocusMode.Auto
        controlCommand = isToggle ? "focus_mode_manual" : "focus_mode_auto"
        camera._config.focus_mode = Number(isToggle)
      }

      label = `Focus - ${isToggle ? "Manual" : "Auto"}`
      newToggleValue = isToggle ? String(FocusMode.Manual) : String(FocusMode.Auto)
      break;
  }

  function updateUI() {
    if (newToggleValue) {
      target.setAttribute("data-toggle-value", newToggleValue)
    }

    if (label) {
      target.innerHTML = label
    }
  }

  if (controlCommand) {
    let command = controlCommand as LumensCommand
    camera.sendCommand((<any>LumensCommand)[command]).then((data) => {
      updateUI()
    })
  } else {
    updateUI()
  }
}

function updateConnectionUI(isConnect: boolean) {
  let statusLed: HTMLElement = <HTMLElement>document.getElementById('status_led');

  if (isConnect) {
    statusLed.classList.add("status-on")
    updateUI(true);
  } else {
    statusLed.classList.remove("status-on")
    updateUI(false);
  }
}

document.getElementById('connect_btn')?.addEventListener("click", async (event) => {
  let statusLed: HTMLElement = <HTMLElement>document.getElementById('status_led');
  let isConnect = statusLed.classList.contains("status-on")

  camera.onEventChanged = (event, message) => {
    switch (event) {
      case CameraEvent.notFound:
      case CameraEvent.disconncted:
      case CameraEvent.timeout:
        if (message) utils.showAlert(message)
        camera.disconnect()
        updateConnectionUI(false)
        break

      case CameraEvent.unknown:
        if (message) utils.showAlert(message)

      default:
        if (message) console.log(message)
        break
    }
  }

  utils.setLoader(true);
  
  if (!isConnect) {
    let ipAddr = (<HTMLInputElement>document.getElementById("cam_ip_input"))?.value;
    camera._config.camera_ip = ipAddr;
  
    try {
      await camera.connect()
      if (camera.isConnected) {
        await queryCameraConfig()
        updateConnectionUI(true)
      }
    } finally {
      utils.setLoader(false);
    }
  } else {
    camera.disconnect()
    updateConnectionUI(false)
  }

  utils.setLoader(false);
})

document.querySelectorAll('.toggle-button').forEach((item) => {
  item.addEventListener('click', (event) => {
    const target = <Element>event.target;
    updateToggleButton(target, null)
  })
})

document.getElementById('init_position')?.addEventListener("change", (event) => {
  let initPosition = (<HTMLSelectElement>event.target)?.value
  if (initPosition) {
    camera._config.init_position = Number(initPosition);
    if (camera._config.init_position === InitPosition.FirstPreset) {
      camera.sendCommand(LumensCommand.init_position_1st_preset)
    } else {
      camera.sendCommand(LumensCommand.init_position_last_mem)
    }
  }
})

document.getElementById("pref_save")?.addEventListener("click", async (event) => {
  if (!camera || !camera.isConnected) return

  utils.setLoader(true);

  let cameraIp = (<HTMLInputElement>document.getElementById("cam_ip_input"))?.value ?? ""
  camera._config.camera_ip = cameraIp;

  let cameraName = (<HTMLInputElement>document.getElementById("cam_name_input"))?.value ?? ""
  await camera.setCameraID(cameraName).then(() => {
    (<HTMLInputElement>document.getElementById("cam_name")).innerHTML = cameraName
    camera._config.camera_name = cameraName
  })
  
  let panSpeed = (<HTMLSelectElement>document.getElementById("pan_speed"))?.value
  if (panSpeed) {
    camera._config.pan_speed = Number(panSpeed);
  }

  let tiltSpeed = (<HTMLSelectElement>document.getElementById("tilt_speed"))?.value
  if (tiltSpeed) {
    camera._config.tilt_speed = Number(tiltSpeed);
  }

  let zoomSpeed = (<HTMLSelectElement>document.getElementById("zoom_speed"))?.value
  if (zoomSpeed) {
    camera._config.zoom_speed = Number(zoomSpeed);
  }

  let focusSpeed = (<HTMLSelectElement>document.getElementById("focus_speed"))?.value
  if (focusSpeed) {
    camera._config.focus_speed = Number(focusSpeed);
  }

  camera.saveConfig();

  utils.setLoader(false);
});

export { camera };