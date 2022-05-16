
class Utils {
  private _blocker: HTMLElement = <HTMLElement>document.getElementById("blocker");

  setLoader(isOn: Boolean) {
    if (isOn) {
      this._blocker.style.display = "block"
    } else {
      this._blocker.style.display = "none";
    }
  }

  showAlert(message: String) {
    var alert = <HTMLElement>document.createElement("IFRAME");
    alert.setAttribute("src", 'data:text/plain,');
    document.documentElement.appendChild(alert);
    window.frames[0].window.alert(message);
    alert.parentElement?.removeChild(alert);
  }
}

export { Utils }