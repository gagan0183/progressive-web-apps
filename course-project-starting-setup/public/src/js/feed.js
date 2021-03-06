var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");
var videoPlayer = document.querySelector("video");
var canvas = document.querySelector("#canvas");
var capButton = document.querySelector("#capture-btn");
var imagePicker = document.querySelector("#image-picker");
var imagePickerArea = document.querySelector("#pick-image");
var picture;

function initializeMedia() {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }
  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    videoPlayer.srcObject = stream;
    videoPlayer.style.display = "block";
  }).catch(function(error) {
    imagePickerArea.style.display = "block";
  });
}

capButton.addEventListener("click", function(event) {
  canvas.style.display = "block";
  videoPlayer.style.display = "none";
  capButton.style.display = "none";
  var context = canvas.getContext("2d");
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
    track.stop();
  });
  picture = dataURItoBlob(canvas.toDataURL());
});

imagePicker.addEventListener("change", function(event) {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  createPostArea.style.transform = "translateY(0)";
  initializeMedia();
  // if (deferredEvent) {
  //   deferredEvent.prompt();
  // }

  // if (deferredEvent) {
  //   deferredEvent.userChoice.then((choiceResult) => {
  //     console.log(choiceResult.outcome);
  //     if (choiceResult.outcome === "dismissed") {
  //       console.log("User cancelled installation");
  //     } else {
  //       console.log("User added to homescreen");
  //     }
  //   });
  // }

  // deferredEvent = null;

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations().then(function(registrations) {
  //     for(var i = 0; i < registrations.length; i++) {
  //       registrations[i].unregister();
  //     }
  //   });
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = "translateY(100vh)";
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvas.style.display = "none";
}

function onButtonClicked(event) {
  console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(function (cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = "cover";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardButtons = document.createElement("button");
  // cardButtons.textContent = "Save";
  // cardSupportingText.appendChild(cardButtons);
  // cardButtons.addEventListener("click", onButtonClicked);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = "https://learnpwa-ee647-default-rtdb.firebaseio.com/posts.json";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log("from web", data);
    networkDataReceived = true;
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readData("posts").then(function (data) {
    if (!networkDataReceived) {
      console.log("from Cache", data);
      updateUI(data);
    }
  });
}

function sendData() {
  const id = new Date().toISOString();
  var postData = new FormData();
  postData.append("id", id);
  postData.append("title", titleInput.value);
  postData.append("location", locationInput.value);
  postData.append("file", picture, id + ".png");
  fetch("https://us-central1-learnpwa-ee647.cloudfunctions.net/storePostData", {
    method: "POST",
    body: postData,
  }).then(function (res) {
    console.log("Sending data", res);
    updateUI();
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid input");
    return;
  }
  closeCreatePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      var post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        picture: picture
      };
      writeData("sync-posts", post).then(function() {
        return sw.sync.register("sync-new-posts");
      }).then(function() {
        var messageInput = document.querySelector("#confirmation-toast");
        var data = { message: "Your post was saved for syncing"};
        messageInput.MaterialSnackbar.showSnackbar(data);
      }).catch(function(error) {
        console.log(error);
      });
    });
  } else {
    sendData();
  }
});
