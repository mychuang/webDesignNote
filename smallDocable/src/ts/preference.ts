import { CameraEvent, LumensCommand, MirrorStatus, FlipStatus, FocusMode, MotionlessPreset, InitPosition } from "./lib/Camera";
import { camera, utils } from "./index"

$(document).ready(function(){
  console.log("DOMContentLoaded")

  $('#cam_name_input')?.on('propertychange input', function(e){
    let element = <HTMLInputElement>e.target
    let filters = [' ', '_', '/']
    filters.forEach(filter => {
      if (element.value.includes(filter)) {
        element.value = element.value.replace(filter, "")
        utils.showAlert('The camera name with " ", "_" and "/" is not valid')
      }
    });
  })

  $('#preference_modal')?.find('.close')?.click(function(){
    loadPreference()
  })

  loadPreference()
  updateUI(false)
});


function loadPreference(){
  camera.loadConfig();
}

function updateUI(setEnable: boolean){
  document.querySelectorAll(".form-control").forEach((element)=>{
    if (setEnable){
      $(element).removeClass("disabled")
    }else{
      if (element.id === "cam_ip_input") return
      $(element).addClass("disabled")
    }
  })

  let mainControl = $(".main-control")
  let presetButton = $("#assign_preset")
  let ipInput = $("#cam_ip_input")

  if (setEnable) {
    mainControl.removeClass("disabled")
    presetButton.removeClass("disabled")
    ipInput.addClass("disabled")
  } else {
    mainControl.addClass("disabled")
    presetButton.addClass("disabled")
    ipInput.removeClass("disabled")
  }
}
export { camera };