var deferredEvent;
var enableNotificationsButtons = document.querySelectorAll(".enable-notifications");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js", { source: "." }).then(() => {
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
      tag: "confirm-notification",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "ok",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
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

function configurePushSub() {
  if(!('serviceWorker' in navigator)) {
    return;
  }

  var swInstances;
  navigator.serviceWorker.ready.then(function(sw) {
    swInstances = sw;
    return sw.pushManager.getSubscription();
  })
  .then(function(sub) {
    if (sub === null) {
      var vapidPublic =
        "BBQt2JHPeJNVdWnh8UTPKOWGPrIVecsyblPZ1Kc4lgIKXPS4kxYDMEjyji1MwnKs-x_LPlW4d2kKCVQKpPEzs_8";
      var convertVapidPublic = urlBase64ToUint8Array(vapidPublic);
      return swInstances.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertVapidPublic,
      });
    } else {

    }
  }).then(function(newSubsc) {
    return fetch("https://learnpwa-ee647-default-rtdb.firebaseio.com/subscriptions.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(newSubsc)
    });
  }).then(function(res) {
    if (res.ok) {
      displayConfirmNotification();
    }
  }).catch(function(err) {
    console.log(err);
  });
}

function askForNotificationPermissions() {
  Notification.requestPermission(function(result) {
    console.log("User choice", result);
    if (result !== "granted") {
      console.log("No notification permission granted");
    } else {
      configurePushSub();
    }
  })
}

if ("Notification" in window && 'serviceWorker' in navigator) {
  enableNotificationsButtons.forEach(enableNotificationsButton => {
    enableNotificationsButton.style.display = "inline-block";
    enableNotificationsButton.addEventListener("click", askForNotificationPermissions);
  });
}

