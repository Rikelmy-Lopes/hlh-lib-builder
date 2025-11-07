export function blockDevTools() {
  if (import.meta.env.PROD) {
    const blockedKeys = ["f3", "f5", "f7", "f12"];
    const blockedCtrl = ["r", "j", "u", "p", "f", "g", "s", "h"];
    const blockedCtrlShift = ["i", "j", "c", "e", "k", "delete"];

    window.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      },
      true
    );

    function keyHandler(event: globalThis.KeyboardEvent) {
      const key = event.key.toLowerCase();

      if (
        blockedKeys.includes(key) ||
        (event.ctrlKey && blockedCtrl.includes(key)) ||
        (event.ctrlKey && event.shiftKey && blockedCtrlShift.includes(key)) ||
        (event.metaKey && ["r", "s"].includes(key))
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }

    document.addEventListener("keydown", keyHandler, true);
    window.addEventListener("keydown", keyHandler, true);
  }
}
