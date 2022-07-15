const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
const webpush = require("web-push");
const fs = require("fs");
const UUID = require("uuid-v4");
const os = require("os");
const busBoy = require("busboy");
const path = require("path");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions


const serviceAccount = require("./learnpwa-ee647-2cd20c265999.json");

const gcconfig = {
  projectId: "learnpwa-ee647",
  keyFilename: "learnpwa-ee647-2cd20c265999.json",
};

const gcs = require("@google-cloud/storage")(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://learnpwa-ee647-default-rtdb.firebaseio.com/",
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // eslint-disable-next-line new-cap
    const uuid = UUID();

    const busboy = busBoy({headers: request.headers});
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on("file", (fieldname, file, {filename, encoding, mimetype}) => {
      console.log(
          // eslint-disable-next-line max-len
          `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      );
      const filepath = path.join(os.tmpdir(), filename);
      upload = {file: filepath, type: mimetype};
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on(
        "field",
        function(
            fieldname,
            val,
            fieldnameTruncated,
            valTruncated,
            encoding,
            mimetype
        ) {
          fields[fieldname] = val;
        }
    );

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", () => {
      const bucket = gcs.bucket("learnpwa-ee647.appspot.com");
      bucket.upload(
          upload.file,
          {
            uploadType: "media",
            metadata: {
              metadata: {
                contentType: upload.type,
                firebaseStorageDownloadTokens: uuid,
              },
            },
          },
          function(err, uploadedFile) {
            if (!err) {
              admin
                  .database()
                  .ref("posts")
                  .push({
                    id: fields.id,
                    title: fields.title,
                    location: fields.location,
                    image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(uploadedFile.name) +
                  "?alt=media&token=" +
                  uuid,
                  })
                  .then(function() {
                    webpush.setVapidDetails(
                        "mailto:g.deepsingh1@gmail.com",
                        // eslint-disable-next-line max-len
                        "BBQt2JHPeJNVdWnh8UTPKOWGPrIVecsyblPZ1Kc4lgIKXPS4kxYDMEjyji1MwnKs-x_LPlW4d2kKCVQKpPEzs_8",
                        "_3zBbGmMQWlPPo53rCzjVShrKmt8ZHqYzmfE1HyNj8I"
                    );
                    return admin.database().ref("subscriptions").once("value");
                  })
                  .then(function(subscriptions) {
                    subscriptions.forEach(function(sub) {
                      const pushConfig = {
                        endpoint: sub.val().endpoint,
                        keys: {
                          auth: sub.val().keys.auth,
                          p256dh: sub.val().keys.p256dh,
                        },
                      };

                      webpush
                          .sendNotification(
                              pushConfig,
                              JSON.stringify({
                                title: "New Post",
                                content: "New Post added!",
                                openUrl: "/help",
                              })
                          )
                          .catch(function(err) {
                            console.log(err);
                          });
                    });
                    response
                        .status(201)
                        .json({message: "Data stored", id: fields.id});
                  })
                  .catch(function(err) {
                    response.status(500).json({error: err});
                  });
            } else {
              console.log(err);
            }
          }
      );
    });

    // eslint-disable-next-line max-len
    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(request.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, "/tmp/" + files.file.name);
    //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
    // });
  });
});
