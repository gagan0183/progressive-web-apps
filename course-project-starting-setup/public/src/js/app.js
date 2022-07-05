var deferredEvent;
var enableNotificationsButtons = document.querySelectorAll(".enable-notifications");

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

function askForNotificationPermissions() {
  Notification.requestPermission(function(result) {
    console.log("User choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted");
    } else {
      
    }
  })
}

if ("Notification" in window) {
  enableNotificationsButtons.forEach(enableNotificationsButton => {
    enableNotificationsButton.style.display = "inline-block";
    enableNotificationsButton.addEventListener("click", askForNotificationPermissions);
  });
}

