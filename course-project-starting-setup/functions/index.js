const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
