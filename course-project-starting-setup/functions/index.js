const functions = require("firebase-functions");
const admin = require("firebase-admin");
const webpush = require("web-push");
const cors = require("cors")({origin: true});

const serviceAccount = require("./learnpwa-ee647-2cd20c265999.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://learnpwa-ee647-default-rtdb.firebaseio.com/",
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin
        .database()
        .ref("posts")
        .push({
          id: request.body.id,
          title: request.body.title,
          location: request.body.location,
          image: request.body.image,
        })
        .then(() => {
          webpush.setVapidDetails(
              "mailto:g.deepsingh1@gmail.com",
              // eslint-disable-next-line max-len
              "BBQt2JHPeJNVdWnh8UTPKOWGPrIVecsyblPZ1Kc4lgIKXPS4kxYDMEjyji1MwnKs-x_LPlW4d2kKCVQKpPEzs_8",
              "_3zBbGmMQWlPPo53rCzjVShrKmt8ZHqYzmfE1HyNj8I"
          );
          return admin.database().ref("subscriptions").once("value");
        }).then(function(subscriptions) {
          subscriptions.forEach(function(subscription) {
            const pushConfig = {
              endpoint: subscription.val().endpoint,
              keys: {
                auth: subscription.val().keys.auth,
                p256dh: subscription.val().keys.p256dh,
              },
            };
            webpush.sendNotification(pushConfig, JSON.stringify({
              title: "New post",
              content: "New post added",
            })).catch(function(err) {
              console.log(err);
            });
          });
          return response.status(201).json({
            message: "Post saved successfully",
            id: request.body.id,
          });
        }).catch((err) => {
          return response.status(500).json({
            error: err,
          });
        });
  });
});
