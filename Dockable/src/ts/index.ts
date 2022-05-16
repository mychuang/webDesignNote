import { Camera, LumensCommand } from "./lib/Camera";
import { Utils } from "./lib/Utils";

let camera = new Camera()
let utils = new Utils()

function handleTwoActionCameraCommand(command: LumensCommand, stop: boolean) {
  if (!command || !camera) return;

  if (stop) {
    switch (command) {
      case LumensCommand.zoom_tele_standard:
      case LumensCommand.zoom_wide_standard:
      case LumensCommand.zoom_tele_variable:
      case LumensCommand.zoom_wide_variable:
        command = LumensCommand.zoom_stop;
        break;

      case LumensCommand.focus_near_standard:
      case LumensCommand.focus_far_standard:
      case LumensCommand.focus_near_variable:
      case LumensCommand.focus_far_variable:
        command = LumensCommand.focus_stop;
        break;

      case LumensCommand.pan_tilt_up:
      case LumensCommand.pan_tilt_down:
      case LumensCommand.pan_tilt_left:
      case LumensCommand.pan_tilt_right:
        command = LumensCommand.pan_tilt_stop;
        break;
    }
  }

  camera.sendCommand(command);
}

document.querySelectorAll(".camera-control").forEach((element) => {
  element.addEventListener("mousedown", (event) => {
    const target = <Element>event.target;

    let commandStr = target.getAttribute("data-control");
    if (!commandStr) return

    let command: LumensCommand = (<any>LumensCommand)[commandStr];

    if (target.classList.contains("two-action-btn")) {
      handleTwoActionCameraCommand(command, false);

      // For the sake of received event when mouse cursor is dragged outside of element, you have to register global event 
      document.addEventListener("mouseup", (event) => {
        handleTwoActionCameraCommand(command, true);
      }, { once: true });
    } else {
      camera.sendCommand(command);
    }
  });

  element.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

export { camera, utils }