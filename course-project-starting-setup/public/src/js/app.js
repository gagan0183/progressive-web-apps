var deferredEvent;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { source: "." }).then(() => {
    console.log("Service worker registered");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
    console.log("before install prompt fired in the sites");
    event.preventDefault();
    deferredEvent = event;
    return false;
});