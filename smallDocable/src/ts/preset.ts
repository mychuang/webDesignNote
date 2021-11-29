import { LumensCommand } from "./lib/Camera";
import { camera } from "./preference"
import { utils } from "./index"

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
]

document.querySelectorAll(".preset-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    if (!camera) return;

    utils.setLoader(true);

    let target = <HTMLButtonElement>event.target;
    let presetNum = target.getAttribute("data-preset")
    camera._config.preset = Number(presetNum);

    camera.sendCommand(LumensCommand.preset_set).then(() => {
      setTimeout(() => {
        utils.setLoader(false);
      }, 800)
    }).catch((err) => {
      let closeButton = <HTMLElement>document.querySelector("#preset_modal")?.querySelector(".close")
      if (closeButton) closeButton.click()
    })
  });
});

document.querySelectorAll(".preset-recall-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    if (!camera) return;

    let target = <HTMLButtonElement>event.target;
    let presetNum = target.getAttribute("data-preset")

    camera._config.preset = Number(presetNum);
    camera.sendCommand(LumensCommand.preset_recall);
  });
})

export { camera };