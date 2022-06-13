if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js", { source: "." }).then(() => {
    console.log("Service worker registered");
  });
}
