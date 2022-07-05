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

function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    var options = {
      body: "You have successfully subscribed to our Notification service!",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-US",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
    };
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification("Successfully subscribed!", options);
    });
  }
  // var options = {
  //   body: "You have successfully subscribed to our Notification service!"
  // };
  // new Notification("Successfully subscribed!", options);
}

function askForNotificationPermissions() {
  Notification.requestPermission(function(result) {
    console.log("User choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted");
    } else {
      displayConfirmNotification();
    }
  })
}

if ("Notification" in window) {
  enableNotificationsButtons.forEach(enableNotificationsButton => {
    enableNotificationsButton.style.display = "inline-block";
    enableNotificationsButton.addEventListener("click", askForNotificationPermissions);
  });
}

