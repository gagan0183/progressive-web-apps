var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

function openCreatePostModal() {
  createPostArea.style.display = "block";
  if (deferredEvent) {
    deferredEvent.prompt();
  }

  deferredEvent.userChoice.then((choiceResult) => {
    console.log(choiceResult.outcome);
    if (choiceResult.outcome === "dismissed") {
      console.log("User cancelled installation");
    } else {
      console.log("User added to homescreen");
    }
  });

  deferredEvent = null;
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
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
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard() {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = "San Francisco Trip";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = "In San Francisco";
  cardSupportingText.style.textAlign = "center";
  // var cardButtons = document.createElement("button");
  // cardButtons.textContent = "Save";
  // cardSupportingText.appendChild(cardButtons);
  // cardButtons.addEventListener("click", onButtonClicked);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

var url = "https://httpbin.org/get";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log("from web", data);
    networkDataReceived = true;
    clearCards();
    createCard();
  });

if ("caches" in window) {
  caches.match(url).then(function (response) {
    if (response) {
      return response.json();
    }
  }).then(function(data) {
    console.log("from Cache", data);
    console.log("networkDataReceived", networkDataReceived);
    if (!networkDataReceived) {
      clearCards();
      createCard();
    }
  });
}
